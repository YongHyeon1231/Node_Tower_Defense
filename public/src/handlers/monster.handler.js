export const monsterSpawnHandler = (data) => {
  if (data.status === 'success') {
    document.dispatchEvent(new CustomEvent('SpawnMonster', { detail: data }));
  }
};

export const monsterKillerHandler = (data) => {
  if (data.status === 'success') {
    document.dispatchEvent(new CustomEvent('KillMonster', { detail: data }));
  }
};
