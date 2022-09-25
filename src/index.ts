import { css, FlattenSimpleInterpolation } from 'styled-components'
import { ContentModel } from '@polym/semantic-htmldata'
import fs from 'fs-extra'
import path from 'path'
import prettier from 'prettier'

const csspath = path.join(__dirname, './tmp/expose.css')

const isExist = await fs.pathExists(csspath)

if (isExist) {
  await fs.unlink(csspath)
}

const format = (css: FlattenSimpleInterpolation) => {
  const replaced = css
    .toString()
    .replaceAll(/,\n/g, '')
    .replaceAll(/\n\s*,/g, '\n')
  const formated = prettier.format(replaced, {
    parser: 'css'
  })
  return formated
}

const alertStyle = css`
  background-color: #ff0f6d;
  color: white;
  pointer-events: none;
  display: block;
  font-size: 1rem;
`

/* -------------------------------------------- */

/* section要素の最初の子要素は見出しであるべき */
// prettier-ignore
const checkSectionInner = css`
  section > :first-child:not(h1):not(h2):not(h3):not(h4):not(h5):not(h6)::after {
    ${alertStyle}
    content: '[HTML WARNING] First child of a "section" should be "h1" | "h2" | "h3" | "h4" | "h5" | "h6"';
  }
`

await fs.appendFile(csspath, format(checkSectionInner))

const contentModelIsPhasing = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'pre', 'p']

/* 内容モデルがPhrasingの場合の子要素違反をチェック */
const checkContentModelIsPhasing = css`
  ${contentModelIsPhasing.map(
    (target) => css`
      ${ContentModel.flowNotPhrasing
        .map((inner) => target + ' ' + inner + '::after')
        .join(',')} {
        ${alertStyle}
        content: '[HTML WARMING] invalid child element : ${ContentModel.flowNotPhrasing
          .map((selector) => `"${selector}"`)
          .join(' | ')}"';
      }
    `
  )}
`

await fs.appendFile(csspath, format(checkContentModelIsPhasing))

/* footerの中にheaderやfooterは入れられない */
const checkFooterInner = css`
  footer header::after,
  footer footer::after {
    ${alertStyle}
    content: '[HTML WARMING] invalid child element: "footer" | "header"';
  }
`

await fs.appendFile(csspath, format(checkFooterInner))

/* ol直下にはli以外入れられない */
const checkOlInner = css`
  ol > :not(li)::after {
    ${alertStyle}
    content: '[HTML WARMING] Directly below "ol" should be "li"';
  }
`

await fs.appendFile(csspath, format(checkOlInner))

/* ul直下にはli以外入れられない */
const checkUlInner = css`
  ul > :not(li)::after {
    ${alertStyle}
    content: '[HTML WARMING] Directly below "ul" should be "li"';
  }
`

await fs.appendFile(csspath, format(checkUlInner))

/* figure要素内のfigcation要素は最初か最後に置く */
const checkFigcationPlace = css`
  figure > figcaption:not(:first-child):not(:last-child)::after {
    ${alertStyle}
    content: '[HTML WARMING] "figcation" should be placed at the beginning or end directly under "figure"';
  }
`

await fs.appendFile(csspath, format(checkFigcationPlace))
