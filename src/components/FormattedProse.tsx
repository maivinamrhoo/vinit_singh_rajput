import React from 'react';
import {
  InlineToken,
  parseFormattedBlocks,
  parseInlineTokens,
} from '../lib/contentUtils';

function renderInline(tokens: InlineToken[]) {
  return tokens.map((token, idx) => {
    if (token.type === 'bold') {
      return (
        <strong key={idx} className="font-semibold text-[#17372F]">
          {token.value}
        </strong>
      );
    }
    if (token.type === 'italic') {
      return (
        <em key={idx} className="italic text-[#40352D]/90">
          {token.value}
        </em>
      );
    }
    if (token.type === 'link') {
      const isExternal = token.href.startsWith('http');
      return (
        <a
          key={idx}
          href={token.href}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          className="text-[#23483D] underline decoration-[#B69A61] underline-offset-4 hover:text-[#B96F4E] transition-colors"
        >
          {token.label}
        </a>
      );
    }
    return <React.Fragment key={idx}>{token.value}</React.Fragment>;
  });
}

export function FormattedProse({
  content,
  dropCap = false,
}: {
  content: string;
  dropCap?: boolean;
}) {
  const blocks = parseFormattedBlocks(content);
  let firstParagraphSeen = false;

  return (
    <div className="space-y-6 font-serif text-[16.5px] leading-[1.85] text-[#40352D]">
      {blocks.map((block, index) => {
        if (block.type === 'h2') {
          return (
            <h2
              key={index}
              className="font-display text-3xl font-semibold text-[#17372F] pt-4 tracking-tight"
            >
              {block.text}
            </h2>
          );
        }

        if (block.type === 'h3') {
          return (
            <h3
              key={index}
              className="font-display text-2xl font-medium text-[#23483D] pt-2"
            >
              {block.text}
            </h3>
          );
        }

        if (block.type === 'blockquote') {
          return (
            <blockquote
              key={index}
              className="my-8 py-6 px-6 sm:px-8 border-y border-[#B69A61]/40 bg-[#EFE2CC]/40 text-center"
            >
              <p className="font-display text-2xl sm:text-[26px] italic leading-relaxed text-[#17372F]">
                &ldquo;{renderInline(parseInlineTokens(block.text))}&rdquo;
              </p>
            </blockquote>
          );
        }

        if (block.type === 'ul') {
          return (
            <ul key={index} className="space-y-2.5 pl-6 list-disc marker:text-[#B96F4E]">
              {block.items.map((item, i) => (
                <li key={i} className="pl-1">
                  {renderInline(parseInlineTokens(item))}
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === 'ol') {
          return (
            <ol key={index} className="space-y-2.5 pl-6 list-decimal marker:text-[#23483D]">
              {block.items.map((item, i) => (
                <li key={i} className="pl-1">
                  {renderInline(parseInlineTokens(item))}
                </li>
              ))}
            </ol>
          );
        }

        const applyDropCap =
          dropCap && !firstParagraphSeen && block.text.trim().length >= 140;
        firstParagraphSeen = true;

        return (
          <p key={index} className={applyDropCap ? 'literary-dropcap' : ''}>
            {renderInline(parseInlineTokens(block.text))}
          </p>
        );
      })}
    </div>
  );
}
