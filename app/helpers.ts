import pkg from 'lodash/fp.js';
const {compose, join, reject, isBoolean, isNil, flatten} = pkg;
import type { MetaDescriptor } from '@remix-run/node'

const cx = (...args: unknown[]) =>
  compose(join(' '), reject(isBoolean), reject(isNil), flatten)(args)

function pageTitle(title: string) {
  return `${title} · Remix Forms`
}

function metaTags({
  title: rawTitle,
  description,
  ...otherTags
}: Record<string, string>) {
  const title = rawTitle ? pageTitle(rawTitle) : null
  const titleTags = title ? { title, 'og:title': title } : {}

  const descriptionTags = description
    ? { description, 'og:description': description }
    : {}

  return {
    ...titleTags,
    ...descriptionTags,
    ...otherTags,
  } as MetaDescriptor
}

export { cx, pageTitle, metaTags }
