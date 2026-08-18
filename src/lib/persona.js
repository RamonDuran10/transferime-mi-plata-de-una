import { T } from '../i18n/es';

export function randomAnimal() {
  const emojis = T.persona.animalEmojis;
  return emojis[Math.floor(Math.random() * emojis.length)];
}
