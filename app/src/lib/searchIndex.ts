import Fuse from 'fuse.js';
import { navigation } from './navigation';

export interface SearchDocument {
  id: string;
  href: string;
  title: string;
  description: string;
  tags: string[];
}

const extraSearchRecords: SearchDocument[] = [
  {
    id: 'search-app',
    href: '/search',
    title: 'Universal search',
    description: 'Search across the entire Avance app for pages, tools, skills, and learning content.',
    tags: ['search', 'universal search', 'app search', 'navigation'],
  },
  {
    id: 'kb-learning-machine-cards',
    href: '/kb-learning-machine',
    title: 'KB Learning Machine cards and checks',
    description: 'Find knowledge base cards, review checks, and KB learning practice items.',
    tags: ['kb', 'cards', 'checks', 'knowledge base'],
  },
  {
    id: 'health-outdoors-actions',
    href: '/health-outdoors',
    title: 'Health and outdoors actions',
    description: 'Discover wellbeing actions, outdoor habits, and review prompts for better health.',
    tags: ['health', 'outdoor', 'wellbeing', 'habits'],
  },
  {
    id: 'msp-skills-reviews',
    href: '/msp-skills',
    title: 'MSP skills and readiness mapping',
    description: 'Search MSP skills, readiness categories, and planning suggestions.',
    tags: ['msp', 'skills', 'readiness', 'training'],
  },
  {
    id: 'msp-scenarios-practice',
    href: '/msp-scenarios',
    title: 'MSP scenario practice',
    description: 'Search customer scenarios, related skills, and problem-solving practice.',
    tags: ['scenarios', 'practice', 'stories', 'skills'],
  },
];

export const searchDocuments: SearchDocument[] = [
  ...navigation.map((item) => ({
    id: `page-${item.href.replace(/\//g, '-') || 'home'}`,
    href: item.href,
    title: item.name,
    description: item.description,
    tags: item.tags,
  })),
  ...extraSearchRecords,
];

export const searchFuse = new Fuse(searchDocuments, {
  keys: ['title', 'description', 'tags'],
  threshold: 0.35,
  ignoreLocation: true,
  includeScore: true,
});
