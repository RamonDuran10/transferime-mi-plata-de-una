import { useState } from 'react';
import { useModalOpen } from '../context/ModalOpenContext';
import { T } from '../i18n/es';

export default function InfoModal() {
  const { infoModalOpen, setInfoModalOpen } = useModalOpen();
  const [step, setStep] = useState(0);
  const [prevOpen, setPrevOpen] = useState(false);
  const steps = T.info.steps;

  // vuelve siempre al paso 1 cada vez que se abre el modal (ajustado durante
  // el render, no en un efecto, para no disparar una vuelta extra de renders)
  if (infoModalOpen !== prevOpen) {
    setPrevOpen(infoModalOpen);
    if (infoModalOpen) setStep(0);
  }

  const close = () => setInfoModalOpen(false);
  const isLast = step === steps.length - 1;
  const current = steps[step];

  return (
    <div
      className={'modal-overlay' + (infoModalOpen ? ' show' : '')}
      onClick={e => { if (e.target === e.currentTarget) close(); }}
    >
      <div className="modal">
        <div className="modal-handle"></div>
        <div className="modal-header">
          <h3>{T.info.title}</h3>
          <button className="modal-close" onClick={close} title={T.modal.closeTitle}>✕</button>
        </div>

        <div className="wizard-card">
          <div className="wizard-emoji">{current.emoji}</div>
          <div className="wizard-title">{current.title}</div>
          <p className="wizard-text">{current.text}</p>
        </div>

        <div className="wizard-dots">
          {steps.map((_, i) => (
            <button
              key={i}
              type="button"
              className={'wizard-dot' + (i === step ? ' active' : '')}
              onClick={() => setStep(i)}
              aria-label={String(i + 1)}
            />
          ))}
        </div>

        <div className="wizard-nav">
          <button
            className="btn-wizard-prev"
            onClick={() => setStep(s => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            {T.info.prev}
          </button>
          <button
            className="btn-wizard-next"
            onClick={() => isLast ? close() : setStep(s => s + 1)}
          >
            {isLast ? T.info.done : T.info.next}
          </button>
        </div>
      </div>
    </div>
  );
}
