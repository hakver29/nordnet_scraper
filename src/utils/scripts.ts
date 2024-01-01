import NordnetAPIWrapper from '../integrations/nordnet/nordnetAPIWrapper';

export async function createNordnetSession() {
  const nordnet = new NordnetAPIWrapper();
  await nordnet.newSession();
  return nordnet;
}