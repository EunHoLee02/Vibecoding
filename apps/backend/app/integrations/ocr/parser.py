import re

from app.common.ingredient_catalog import match_ingredient


UNIT_ALIASES = {
    "ug": "mcg",
    "mcg": "mcg",
    "mg": "mg",
    "g": "g",
    "ml": "ml",
    "iu": "IU",
}

LINE_NORMALIZATION_MAP = str.maketrans(
    {
        "|": " ",
        "／": "/",
        "，": ",",
        "：": ":",
        "；": ";",
        "（": "(",
        "）": ")",
    }
)

AMOUNT_PATTERN = re.compile(
    r"(?P<name>[A-Za-z가-힣][A-Za-z0-9가-힣+\-()\[\],.\s]*?)"
    r"(?P<amount>\d+(?:[.,]\d+)?)\s*"
    r"(?P<unit>mg|mcg|ug|g|ml|iu)\b",
    re.IGNORECASE,
)

AMOUNT_ONLY_PATTERN = re.compile(
    r"^(?P<amount>\d+(?:[.,]\d+)?)\s*(?P<unit>mg|mcg|ug|g|ml|iu)$",
    re.IGNORECASE,
)

MANUFACTURER_PATTERN = re.compile(
    r"(?:제조사|제조원|manufacturer|made by|distributed by)\s*[:\-]?\s*(?P<value>.+)",
    re.IGNORECASE,
)

PRODUCT_NAME_SKIP_PATTERNS = [
    "nutrition facts",
    "supplement facts",
    "영양정보",
    "nutrition",
    "serving",
    "ingredients",
    "원재료",
]


def normalize_text_line(line: str) -> str:
    cleaned = line.translate(LINE_NORMALIZATION_MAP)
    cleaned = re.sub(r"\s+", " ", cleaned).strip(" -_:")
    return cleaned


def normalize_amount_token(value: str) -> str:
    normalized = value.lower().replace(",", ".")
    normalized = normalized.replace("o", "0")
    normalized = normalized.replace("l", "1")
    normalized = normalized.replace("i", "1")
    return normalized


def normalize_ocr_amount_noise(value: str) -> str:
    normalized = re.sub(
        r"(?<=\d)[oO](?=\s*(?:mg|mcg|ug|g|ml|iu)\b)",
        "0",
        value,
    )
    normalized = re.sub(
        r"(?<=\d)[lIi](?=\s*(?:mg|mcg|ug|g|ml|iu)\b)",
        "1",
        normalized,
    )
    return normalized


def normalize_unit_token(value: str) -> str:
    normalized = value.lower().replace("μ", "u").replace("µ", "u")
    normalized = normalized.replace("㎍", "ug")
    normalized = normalized.replace("mc9", "mcg")
    normalized = normalized.replace("m9", "mg")
    return UNIT_ALIASES.get(normalized, value)


def looks_like_amount_only(line: str) -> bool:
    return bool(AMOUNT_ONLY_PATTERN.fullmatch(normalize_ocr_amount_noise(line)))


def looks_like_manufacturer(line: str) -> bool:
    return bool(MANUFACTURER_PATTERN.search(line))


def looks_like_ingredient_name_candidate(line: str) -> bool:
    lowered = line.lower()
    if len(line) < 2:
        return False
    if looks_like_manufacturer(line):
        return False
    if any(pattern in lowered for pattern in PRODUCT_NAME_SKIP_PATTERNS):
        return False
    if re.search(r"\d", line):
        return False
    if match_ingredient(line):
        return True
    return any(keyword in lowered for keyword in ["vitamin", "zinc", "magnesium", "calcium", "iron", "omega", "lutein", "probiotic"])


def merge_fragmented_lines(lines: list[str]) -> list[str]:
    merged: list[str] = []
    index = 0

    while index < len(lines):
        current = lines[index]
        next_line = lines[index + 1] if index + 1 < len(lines) else None

        if (
            next_line
            and not looks_like_manufacturer(current)
            and not AMOUNT_PATTERN.search(current)
            and looks_like_amount_only(next_line)
        ):
            merged.append(f"{current} {next_line}")
            index += 2
            continue

        merged.append(current)
        index += 1

    return merged


def resolve_amount_only_lines(lines: list[str]) -> list[str]:
    resolved: list[str] = []

    for line in lines:
        amount_only_match = AMOUNT_ONLY_PATTERN.fullmatch(line)
        if amount_only_match:
            for index in range(len(resolved) - 1, -1, -1):
                candidate = resolved[index]
                if looks_like_ingredient_name_candidate(candidate):
                    resolved[index] = f"{candidate} {line}"
                    break
            else:
                resolved.append(line)
            continue

        resolved.append(line)

    return resolved


def normalize_ingredient_name(name: str) -> str:
    cleaned = re.sub(r"\s+", " ", name).strip(" ,.-:")
    matched = match_ingredient(cleaned)
    if matched:
        return matched["standard_name"]
    return cleaned


def guess_product_name(lines: list[str], ingredient_lines: set[str]) -> str | None:
    for line in lines[:6]:
        lowered = line.lower()
        if len(line) < 3:
            continue
        if line in ingredient_lines:
            continue
        if any(pattern in lowered for pattern in PRODUCT_NAME_SKIP_PATTERNS):
            continue
        if looks_like_manufacturer(line):
            continue
        return line
    return None


def guess_manufacturer(lines: list[str]) -> str | None:
    for line in lines:
        match = MANUFACTURER_PATTERN.search(line)
        if match:
            return match.group("value").strip()

        lowered = line.lower()
        if any(keyword in lowered for keyword in ["pharma", "company", "corp", "labs", "제약", "주식회사"]):
            return line

    return None


def parse_ingredient_candidates(lines: list[str]) -> tuple[list[dict], set[str]]:
    ingredients: list[dict] = []
    seen: set[tuple[str, str, str]] = set()
    ingredient_lines: set[str] = set()

    for line in lines:
        segments = [normalize_text_line(item) for item in re.split(r"[;/]", line)]

        for segment in segments:
            normalized_segment = normalize_ocr_amount_noise(segment)
            match = AMOUNT_PATTERN.search(normalized_segment)
            if not match:
                continue

            name = normalize_ingredient_name(match.group("name"))
            amount = normalize_amount_token(match.group("amount"))
            unit = normalize_unit_token(match.group("unit"))

            if not name:
                continue

            key = (name.lower(), amount, unit)
            if key in seen:
                continue
            seen.add(key)
            ingredient_lines.add(line)

            ingredients.append(
                {
                    "ingredient_name_raw": name,
                    "amount_value": amount,
                    "amount_unit": unit,
                    "is_primary_display_value": len(ingredients) == 0,
                }
            )

    return ingredients, ingredient_lines


def build_extracted_payload(raw_lines: list[str], raw_text: str) -> dict:
    lines = [
        normalize_ocr_amount_noise(normalize_text_line(line))
        for line in raw_lines
        if normalize_text_line(line)
    ]
    merged_lines = resolve_amount_only_lines(merge_fragmented_lines(lines))
    ingredient_list, ingredient_lines = parse_ingredient_candidates(merged_lines)

    return {
        "product_name": guess_product_name(merged_lines, ingredient_lines),
        "manufacturer": guess_manufacturer(merged_lines),
        "ingredient_list": ingredient_list,
        "text_lines": merged_lines,
        "raw_text": raw_text,
    }
