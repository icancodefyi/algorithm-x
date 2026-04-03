import { cn } from "@/lib/utils";

interface TypographyProps {
  children: React.ReactNode;
  className?: string;
}

export function Typography({ children, className }: TypographyProps) {
  return (
    <div
      className={cn(
        // Base text
        "text-[#3d3530] leading-[1.8] text-[16.5px]",
        // h1
        "[&_h1]:text-[2.1rem] [&_h1]:font-semibold [&_h1]:text-[#0a0a0a] [&_h1]:leading-tight [&_h1]:mt-10 [&_h1]:mb-4",
        // h2
        "[&_h2]:text-[1.5rem] [&_h2]:font-semibold [&_h2]:text-[#0a0a0a] [&_h2]:leading-snug [&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:pb-3 [&_h2]:border-b [&_h2]:border-[#e8e4de]",
        // h3
        "[&_h3]:text-[1.2rem] [&_h3]:font-semibold [&_h3]:text-[#0a0a0a] [&_h3]:leading-snug [&_h3]:mt-8 [&_h3]:mb-3",
        // h4
        "[&_h4]:text-[0.85rem] [&_h4]:font-semibold [&_h4]:text-[#0a0a0a] [&_h4]:mt-6 [&_h4]:mb-2 [&_h4]:uppercase [&_h4]:tracking-wide",
        // Paragraph
        "[&_p]:mb-6 [&_p]:leading-[1.85]",
        // Links
        "[&_a]:text-[#0a0a0a] [&_a]:underline [&_a]:underline-offset-3 [&_a]:decoration-[#b0a89e] [&_a:hover]:decoration-[#0a0a0a] [&_a]:transition-all",
        // Unordered list
        "[&_ul]:mb-6 [&_ul]:pl-6 [&_ul]:list-disc [&_ul]:space-y-1.5",
        // Ordered list
        "[&_ol]:mb-6 [&_ol]:pl-6 [&_ol]:list-decimal [&_ol]:space-y-1.5",
        // List item
        "[&_li]:leading-[1.75] [&_li]:text-[#3d3530]",
        // Nested lists
        "[&_li_ul]:mt-1.5 [&_li_ul]:mb-0 [&_li_ol]:mt-1.5 [&_li_ol]:mb-0",
        // Blockquote
        "[&_blockquote]:border-l-[3px] [&_blockquote]:border-[#0a0a0a] [&_blockquote]:pl-6 [&_blockquote]:italic [&_blockquote]:text-[#7a7268] [&_blockquote]:my-8 [&_blockquote]:text-[1.05rem] [&_blockquote]:leading-relaxed",
        // Inline code
        "[&_:not(pre)_code]:bg-[#f3f0eb] [&_:not(pre)_code]:text-[#0a0a0a] [&_:not(pre)_code]:rounded [&_:not(pre)_code]:px-1.5 [&_:not(pre)_code]:py-0.5 [&_:not(pre)_code]:text-[0.88em] [&_:not(pre)_code]:font-mono [&_:not(pre)_code]:border [&_:not(pre)_code]:border-[#e8e4de]",
        // Code block
        "[&_pre]:bg-[#0a0a0a] [&_pre]:rounded-xl [&_pre]:p-6 [&_pre]:my-8 [&_pre]:overflow-x-auto [&_pre]:border [&_pre]:border-[#1e1e1e]",
        "[&_pre_code]:bg-transparent [&_pre_code]:border-0 [&_pre_code]:p-0 [&_pre_code]:text-[#e8e4de] [&_pre_code]:text-sm [&_pre_code]:leading-relaxed",
        // Images
        "[&_img]:rounded-xl [&_img]:w-full [&_img]:my-8 [&_img]:border [&_img]:border-[#e8e4de]",
        // Horizontal rule
        "[&_hr]:border-0 [&_hr]:border-t [&_hr]:border-[#e8e4de] [&_hr]:my-10",
        // Strong / em
        "[&_strong]:font-semibold [&_strong]:text-[#0a0a0a]",
        "[&_em]:italic [&_em]:text-[#5a4e47]",
        // Table
        "[&_table]:w-full [&_table]:border-collapse [&_table]:my-8 [&_table]:text-sm",
        "[&_th]:border [&_th]:border-[#e8e4de] [&_th]:bg-[#fafaf8] [&_th]:px-4 [&_th]:py-2.5 [&_th]:text-left [&_th]:font-semibold [&_th]:text-[#0a0a0a]",
        "[&_td]:border [&_td]:border-[#e8e4de] [&_td]:px-4 [&_td]:py-2.5",
        "[&_tr:nth-child(even)_td]:bg-[#fafaf8]",
        className,
      )}
    >
      {children}
    </div>
  );
}
