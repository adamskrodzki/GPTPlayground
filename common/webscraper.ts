import axios from 'axios';
import cheerio from 'cheerio';

interface Section {
  title: string;
  content: string[];
  subSections: Section[];
  link?: string;
}

type NullableSection = Section | null;

async function getHierarchicalHeadersContent(
  url: string,
): Promise<NullableSection[]> {
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);

  const sections: NullableSection[] = [];
  const currentSections: NullableSection[] = [
    null,
    null,
    null,
    null,
    null,
    null,
  ];

  $('h1, h2, h3, h4, h5, h6').each((index, element) => {
    const tag = $(element).get(0)!.tagName;

    if (tag === 'a' && !$(element).attr('href')) return;

    const level = tag === 'a' ? 6 : parseInt(tag.charAt(1)); // Treat links as lowest level

    const section: Section = {
      title: $(element).text().trim(),
      content: [],
      subSections: [],
      link: tag === 'a' ? $(element).attr('href') : undefined,
    };

    // Check if the next sibling is a paragraph and extract its text
    let sibling = $(element).next();
    while (sibling && sibling.length && !sibling.is('h1, h2, h3, h4, h5, h6')) {
      if (sibling.is('p')) {
        section.content.push(sibling.text().trim());
      }
      sibling = sibling.next();
    }

    currentSections[level - 1] = section;

    // Add this section as a sub-section of its parent (if any)
    if (level > 1 && currentSections[level - 2]) {
      currentSections[level - 2]!.subSections.push(section);
    }

    // If this is a top-level section, add it to the sections array
    if (level === 1) {
      sections.push(section);
    }

    // Reset any subsections at levels below this one
    for (let i = level; i < 6; i++) {
      currentSections[i] = null;
    }
  });

  return sections;
}

export { getHierarchicalHeadersContent, Section, NullableSection };
