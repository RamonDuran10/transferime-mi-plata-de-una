import { useBillState } from '../context/BillContext';
import { useBillActions } from '../hooks/useBillActions';
import { T } from '../i18n/es';

export default function LiveIndicator() {
  const state = useBillState();
  const { handleLiveIndicatorAction } = useBillActions();

  if (state.mode === 'solo') return null;

  let text, btnText;
  if (state.mode === 'host') {
    text = T.live.hostBanner;
    btnText = T.live.closeSessionButton;
  } else {
    const host = state.personas.find(p => !state.liveSession.myPersonaIds.includes(p.id));
    text = T.live.bannerLive(host ? host.name : '');
    btnText = T.live.leaveSession;
  }

  return (
    <div className="live-indicator">
      <span id="liveIndicatorText">{text}</span>
      <button className="btn-leave-live" onClick={handleLiveIndicatorAction}>{btnText}</button>
    </div>
  );
}
