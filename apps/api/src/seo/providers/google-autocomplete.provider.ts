import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class GoogleAutocompleteProvider {
  private readonly logger = new Logger(GoogleAutocompleteProvider.name);
  private readonly baseUrl =
    'https://suggestqueries.google.com/complete/search';

  /**
   * Fetch autocomplete suggestions from Google.
   * @param query The seed keyword.
   * @param lang Language code (default 'en').
   * @param country Country code (default 'us').
   */
  async getSuggestions(
    query: string,
    lang = 'en',
    country = 'us',
  ): Promise<string[]> {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          client: 'chrome',
          q: query,
          hl: lang,
          gl: country,
        },
      });

      // Google returns [query, [suggestions], [], [], ...]
      if (Array.isArray(response.data) && Array.isArray(response.data[1])) {
        return response.data[1];
      }

      return [];
    } catch (error) {
      this.logger.error(
        `Failed to fetch autocomplete for "${query}": ${error.message}`,
      );
      return [];
    }
  }

  /**
   * Deep discovery: Fetch suggestions for "seed a", "seed b", ..., "seed z".
   */
  async deepDiscover(
    query: string,
    lang = 'en',
    country = 'us',
  ): Promise<string[]> {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789'.split('');
    const results = new Set<string>();

    // Get base suggestions
    const base = await this.getSuggestions(query, lang, country);
    base.forEach((s) => results.add(s));

    // Get alphabetical suggestions
    const promises = alphabet.map((char) =>
      this.getSuggestions(`${query} ${char}`, lang, country),
    );
    const allSuggestions = await Promise.all(promises);

    allSuggestions.flat().forEach((s) => results.add(s));

    return Array.from(results);
  }
}
