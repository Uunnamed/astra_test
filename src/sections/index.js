import Hero from './Hero.astro';
import TextBlock from './TextBlock.astro';

// Section type name in WordPress (Flexible Content layout) -> Astro component.
export const sectionTypes = {
  hero: Hero,
  text_block: TextBlock,
};
