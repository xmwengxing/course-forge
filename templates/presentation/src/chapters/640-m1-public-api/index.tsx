import type { ChapterStepProps } from "../../registry/types";
import { MaskReveal } from "../../components/MaskReveal";
import "./index.css";

export default function PublicApiChapter({ step }: ChapterStepProps) {
  if (step === 0) {
    return (
      <div className="api-scene scene-pad">
        <div className="api-badge">第二粮仓</div>

        <h1 className="api-title" style={{ marginTop: "var(--space-5)" }}>
          <MaskReveal show duration={800}>
            公开API = 去合作农场订购
          </MaskReveal>
        </h1>

        <div className="api-demo" style={{ marginTop: "var(--space-7)" }}>
          <div className="api-req-card">
            <div className="api-method">GET</div>
            <div className="api-url">/api/stock/news</div>
            <div className="api-send-btn">发送请求</div>
          </div>

          <div className="api-arrow">→</div>

          <div className="api-resp-card">
            <div className="api-resp-header">
              <span className="api-resp-label">Response</span>
              <span className="api-resp-status">200 OK</span>
            </div>
            <pre className="api-json">{
`{
  "status":  "ok",
  "total":   1426,
  "items": [
    { "title": "玉米收购价上涨", "hot": true },
    { "title": "东北墒情监测报告", "hot": false }
  ]
}`}</pre>
          </div>
        </div>

        <p className="api-tagline" style={{ marginTop: "var(--space-7)" }}>
          <MaskReveal show delay={400} duration={700}>
            能用API解决的，绝不自己写爬虫去硬爬
          </MaskReveal>
        </p>

        <div className="api-props" style={{ marginTop: "var(--space-5)" }}>
          <span className="api-prop-item">🔹 数据已结构化</span>
          <span className="api-prop-item">🔹 合规安全</span>
          <span className="api-prop-item">🔹 省时省力</span>
        </div>
      </div>
    );
  }

  return null;
}
