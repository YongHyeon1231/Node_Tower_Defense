const ping = async (uuid, payload) => {
  return {
    message: `Pong! ${payload.ping}`,
  };
};
const handlerMappings = {
  999: ping,
};

export default handlerMappings;
