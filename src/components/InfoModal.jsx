import { useModalOpen } from '../context/ModalOpenContext';
import { T } from '../i18n/es';

export default function InfoModal() {
  const { infoModalOpen, setInfoModalOpen } = useModalOpen();

  return (
    <div
      className={'modal-overlay' + (infoModalOpen ? ' show' : '')}
      onClick={e => { if (e.target === e.currentTarget) setInfoModalOpen(false); }}
    >
      <div className="modal">
        <div className="modal-handle"></div>
        <div className="modal-header">
          <h3>{T.info.title}</h3>
          <button className="modal-close" onClick={() => setInfoModalOpen(false)} title={T.modal.closeTitle}>✕</button>
        </div>
        <ol className="info-steps">
          {T.info.steps.map((step, i) => (
            <li key={i}>
              <span className="step-num">{i + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
