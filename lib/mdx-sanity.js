import { bundleMDX } from 'mdx-bundler'
import fs from 'fs'
import matter from 'gray-matter'
import path from 'path'
import readingTime from 'reading-time'
import { visit } from 'unist-util-visit'
import getAllFilesRecursively from './utils/files'
// Remark packages
import remarkGfm from 'remark-gfm'
import remarkFootnotes from 'remark-footnotes'
import remarkMath from 'remark-math'
import remarkExtractFrontmatter from './remark-extract-frontmatter'
import remarkCodeTitles from './remark-code-title'
import remarkTocHeadings from './remark-toc-headings'
import remarkImgToJsx from './remark-img-to-jsx'
// Rehype packages
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeKatex from 'rehype-katex'
import rehypeCitation from 'rehype-citation'
import rehypePrismPlus from 'rehype-prism-plus'
import rehypePresetMinify from 'rehype-preset-minify'
import { createClient, groq } from 'next-sanity'

const root = process.cwd()
const client = createClient({
  projectId: process.env.SANITY_API_PROJECT_ID,
  dataset: process.env.SANITY_API_DATASET,
  apiVersion: 'v2021-10-21',
  useCdn: true,
})
export async function getMdx(type) {
  const mdx = await client.fetch(groq`*[_type == 'mdx' && group == '${type}']{slug}`)
  return mdx
}

export function formatSlug(slug) {
  return slug
}

export function dateSortDesc(a, b) {
  if (a > b) return -1
  if (a < b) return 1
  return 0
}

export async function getMdxBySlug(slug) {
  /*const mdxPath = path.join(root, 'data', type, `${slug}.mdx`)
  const mdPath = path.join(root, 'data', type, `${slug}.md`)
  const source = fs.existsSync(mdxPath)
    ? fs.readFileSync(mdxPath, 'utf8')
    : fs.readFileSync(mdPath, 'utf8')
*/
  const snapshot = await client.fetch(groq`*[slug.current == '${slug}']`)
  const mdx = snapshot[0]
  // https://github.com/kentcdodds/mdx-bundler#nextjs-esbuild-enoent
  if (process.platform === 'win32') {
    process.env.ESBUILD_BINARY_PATH = path.join(root, 'node_modules', 'esbuild', 'esbuild.exe')
  } else {
    process.env.ESBUILD_BINARY_PATH = path.join(root, 'node_modules', 'esbuild', 'bin', 'esbuild')
  }

  let toc = []

  const { code, frontmatter } = await bundleMDX({
    source: mdx.content,
    // mdx imports can be automatically source from the components directory
    cwd: path.join(root, 'components'),
    mdxOptions(options, frontmatter) {
      // this is the recommended way to add custom remark/rehype plugins:
      // The syntax might look weird, but it protects you in case we add/remove
      // plugins in the future.
      options.remarkPlugins = [
        ...(options.remarkPlugins ?? []),
        remarkExtractFrontmatter,
        [remarkTocHeadings, { exportRef: toc }],
        remarkGfm,
        remarkCodeTitles,
        [remarkFootnotes, { inlineNotes: true }],
        remarkMath,
        remarkImgToJsx,
      ]
      options.rehypePlugins = [
        ...(options.rehypePlugins ?? []),
        rehypeSlug,
        rehypeAutolinkHeadings,
        [rehypeKatex],
        [rehypeCitation, { path: path.join(root, 'data') }],
        [rehypePrismPlus, { ignoreMissing: true }],
        rehypePresetMinify,
      ]
      return options
    },
    esbuildOptions: (options) => {
      options.loader = {
        ...options.loader,
        '.js': 'jsx',
      }
      return options
    },
  })

  return {
    mdxSource: code,
    toc,
    frontMatter: {
      readingTime: readingTime(code),
      tags: mdx.tags,
      slug: mdx.slug.current,
      date: mdx.date ? new Date(mdx.date).toISOString() : null,
      summary: mdx.summary,
      title: mdx.title,
      group: mdx.group,
    },
  }
}

export async function getAllFilesFrontMatter(folder) {
  var mdx
  if (folder == 'all') {
    mdx = await client.fetch(groq`*[_type == 'mdx']{tags, slug, date, summary, title, group}`)
  } else {
    mdx = await client.fetch(
      groq`*[_type == 'mdx' && group == '${folder}']{tags, slug, date, summary, title, group}`
    )
  }
  const allFrontMatter = []

  mdx.forEach((mdx) => {
    if (mdx.draft !== true) {
      allFrontMatter.push({
        tags: mdx.tags,
        slug: mdx.slug.current,
        date: mdx.date ? new Date(mdx.date).toISOString() : null,
        summary: mdx.summary,
        title: mdx.title,
        group: mdx.group,
      })
    }
  })
  return allFrontMatter.sort((a, b) => dateSortDesc(a.date, b.date))
}
