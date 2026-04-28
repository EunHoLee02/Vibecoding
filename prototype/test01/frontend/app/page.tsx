import Link from "next/link";

export default function HomePage() {
  return (
    <main className="stack">
      <section className="hero">
        <div className="badge info">input_to_analysis_to_result</div>
        <h1>입력부터 결과 확인까지 3분 안에 보여주는 Well Track 데모</h1>
        <p>
          이 프로토타입은 로그인 없이 바로 시작합니다. 영양제 조합을 직접 입력하거나 샘플
          업로드 stub를 사용한 뒤, 중복 성분과 고함량 가능성, 복용 시간 가이드를 일반적인
          참고 정보 수준으로 빠르게 확인할 수 있습니다.
        </p>
        <div className="nav">
          <Link className="button-link button-primary" href="/manual">
            직접 입력 시작
          </Link>
          <Link className="button-link" href="/sample">
            샘플 업로드 체험
          </Link>
        </div>
      </section>

      <section className="card-grid two">
        <article className="panel stack">
          <h2 className="section-title">직접 입력 흐름</h2>
          <p className="muted">
            제품명, 성분명, 함량만 입력해도 분석을 실행할 수 있도록 최소 입력 구조로
            구성했습니다.
          </p>
          <ul className="list">
            <li>영양제 1개 이상 추가</li>
            <li>성분/함량 입력</li>
            <li>즉시 분석 결과 확인</li>
          </ul>
        </article>

        <article className="panel stack">
          <h2 className="section-title">샘플 업로드 흐름</h2>
          <p className="muted">
            실제 OCR 대신 샘플 카드 또는 파일명 기반 stub 파싱으로 업로드 경험만 빠르게
            시연합니다.
          </p>
          <ul className="list">
            <li>샘플 카드 선택</li>
            <li>파싱 결과 미리보기</li>
            <li>이 조합으로 분석 실행</li>
          </ul>
        </article>
      </section>
    </main>
  );
}
