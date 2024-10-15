export const moveStageHandler = (data) => {
  if (data.status === 'success') {
    console.log('스테이지 이동 성공:', data.stage);
    document.dispatchEvent(new CustomEvent('StageMoved', { detail: data }));
  } else {
    console.log('스테이지 이동 실패:', data.message);
    alert(data.message); // 실패 메시지 알림
  }
};
