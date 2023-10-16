import Pluralize = require('pluralize');

export const log = (message?: any, ...optionalParams: any[]) => {
    return (message) ? console.log(message, ...optionalParams) : console.log();
  }

  export const batchArray = <T>(items: Array<T>, batchSize: number = 100): Array<Array<T>> => {
    let batches = new Array<Array<T>>();
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      batches.push(batch);
    }
    return batches;
  }

  export const mapSequentially = async <T, R>(collection: Array<T>, f: (item: T) => Promise<R>): Promise<Array<R>> => {
    const results = new Array<R>();
    for (const item of collection) {
      const result = await f(item)
      results.push(result)
    }
    return results;
  }
  export function toAlphaNumericSnakeCase(text: string): string {
    const matches = text.replace(/'/g, "").match(/[A-Za-z0-9]+/g);
    if (matches) {
      return matches.join("-");
    } else {
      return "";
    }
  }
  export function extractYears(text: string): Array<number> {
    let capture = text.match(/(19[5-9]\d|20[0-4]\d|2050)/g);
    if (!capture) return [];
    let numbers = capture.map(item => parseInt(item.trim()));
    return numbers;
  }

  export function pluralize(words: Array<string>): Array<string> {
    let singularAndPlural = new Array<string>();
    let alphaOnly = words.filter(word => !Number(word));
    alphaOnly.forEach(
      word => {
        let singular = Pluralize.singular(word);
        let plural = Pluralize.plural(word);
        singularAndPlural.push(singular);
        singularAndPlural.push(plural);
      }
    )
    return singularAndPlural;
  }

  
  export function decadeToYears(years: Array<number>, centurySplit: number = 50): Array<number> {
    let allYears = Array<number>();
    years.forEach(
      year => {
        let text = year.toString();
        let tens = (text.length > 1) ? text.slice(text.length - 2, text.length - 1) : "0";
        let millennium = "19";
        if (text.length === 4) {
          millennium = text.slice(0, text.length - 2);
        } else if (text.length === 2) {
          millennium = (year >= centurySplit) ? "19" : "20";
        } else if (text.length === 1) {
          millennium = "20";
        }
  
        let digits = [...Array(10).keys()];
        let currentYears = new Array<number>();
        currentYears.push(parseInt(millennium + "00"));
        digits.forEach(
          digit => {
            let fullYear = parseInt(millennium + tens + digit.toString());
            let decade = parseInt(tens + digit.toString());
            currentYears.push(decade);
            currentYears.push(fullYear);
          }
        );
        allYears.push.apply(allYears, currentYears);
      })
    return allYears.sort((a, b) => b - a);
  }

  export function dedupe(words: Array<any>): Array<any> {
    // maintains order unlike `return [...new Set(words)]`
    let unique = words.reduce(function (a, b) {
      if (a.indexOf(b) < 0) a.push(b);
      return a;
    }, []);
    return unique;
  }
  
  export function normalizeWords(words: Array<string>): Array<string> {
    const cleaned = words.filter(word => !!word);
    const lowerCased = cleaned.map(word => word.toLowerCase());
    const deduped = dedupe(lowerCased);
    return deduped;
  }