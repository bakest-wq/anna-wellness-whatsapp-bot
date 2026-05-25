"use client";

import { SESSION_FLOW_STEPS } from "@/lib/session-flow";
import { FadeUp } from "./motion";

export function SessionFlowSection() {
  return (
    <section
      id="experience"
      className="sw-flow scroll-mt-24"
      aria-labelledby="flow-title"
    >
      <div className="sw-container sw-container--narrow">
        <FadeUp>
          <p className="sw-eyebrow">Как проходит сеанс</p>
          <h2 id="flow-title" className="sw-title sw-flow__title">
            Как ощущается ваш сеанс
          </h2>
        </FadeUp>

        <ol className="sw-flow__list">
          {SESSION_FLOW_STEPS.map((step, index) => (
            <li key={step.id}>
            <FadeUp delay={index * 0.06}>
              <div className="sw-flow__step">
                <span className="sw-flow__num" aria-hidden>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="sw-flow__name">{step.title}</h3>
                  <p className="sw-flow__text">{step.description}</p>
                </div>
              </div>
            </FadeUp>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
