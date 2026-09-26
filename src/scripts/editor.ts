import "@shoelace-style/shoelace/dist/shoelace.js";

type BlockType = "heading" | "paragraph" | "image" | "link";
type ReviewStatus = "pending" | "approved" | "needs-work";
type Severity = "error" | "warning" | "info";

interface CommentReply {
  id: string;
  author: string;
  body: string;
  createdAt: string;
}

interface CommentItem {
  id: string;
  author: string;
  body: string;
  createdAt: string;
  resolved: boolean;
  replies: CommentReply[];
}

interface ContentBlock {
  id: string;
  type: BlockType;
  text: string;
  accessibleText: string;
  headingLevel?: number;
  imageSrc?: string;
  imageAlt?: string;
  linkHref?: string;
  changeReason: string;
  reviewStatus: ReviewStatus;
  comments: CommentItem[];
}

interface GlossaryTerm {
  id: string;
  source: string;
  preferred: string;
  note: string;
}

interface VersionSnapshot {
  id: string;
  label: string;
  createdAt: string;
  blocks: ContentBlock[];
  glossary: GlossaryTerm[];
}

interface ChapterProject {
  id: string;
  title: string;
  subject: string;
  grade: string;
  blocks: ContentBlock[];
  glossary: GlossaryTerm[];
  versions: VersionSnapshot[];
  reviewBatches: ReviewBatch[];
  updatedAt: string;
}

interface AccessibilityIssue {
  id: string;
  blockId: string;
  type: "heading" | "link" | "image" | "glossary" | "sentence";
  severity: Severity;
  title: string;
  detail: string;
  suggestion: string;
}

type IssueOutcome = "resolved" | "new" | "withdrawn";

interface IssueSnapshot {
  id: string;
  blockId: string;
  type: AccessibilityIssue["type"];
  severity: Severity;
  title: string;
  detail: string;
  suggestion: string;
  blockLabel: string;
}

type BlockSnapshot = Pick<ContentBlock, "id" | "type" | "text" | "accessibleText" | "headingLevel" | "imageSrc" | "imageAlt" | "linkHref" | "changeReason" | "reviewStatus">;

interface IssueWithdrawal {
  issueId: string;
  reason: string;
  createdAt: string;
}

interface IssueDisposition {
  issueId: string;
  outcome: IssueOutcome;
  title: string;
  severity: Severity;
  blockId: string;
  blockLabel: string;
  note: string;
}

interface BatchReport {
  resolved: IssueDisposition[];
  added: IssueDisposition[];
  withdrawn: IssueDisposition[];
}

interface ReviewBatch {
  id: string;
  label: string;
  startedAt: string;
  reopenedAt?: string;
  closedAt?: string;
  closeNote?: string;
  baseline: {
    issues: IssueSnapshot[];
    blocks: BlockSnapshot[];
    versionId: string;
    versionLabel: string;
  };
  /** 批次中实际改到标题层级、图片说明或链接文案、因而回到待复核的块 */
  recheckBlockIds: string[];
  withdrawals: IssueWithdrawal[];
  report?: BatchReport;
}

const STORAGE_KEY = "sologsb-1009-accessible-textbook-v1";
const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

function createSeedProject(): ChapterProject {
  const blocks: ContentBlock[] = [
    {
      id: "block-h1",
      type: "heading",
      headingLevel: 1,
      text: "第三章 水循环与城市",
      accessibleText: "第三章 水循环与城市",
      changeReason: "",
      reviewStatus: "approved",
      comments: [],
    },
    {
      id: "block-p1",
      type: "paragraph",
      text: "城市中的水并非取之不尽，由于其会通过蒸发、降水以及地表径流等若干复杂过程在自然界中持续循环，因此理解这些过程对于建设具有韧性的城市具有十分重要的意义。",
      accessibleText: "城市里的水会不断循环。它经过蒸发、降水并沿地面流动。了解这些过程，可以帮助我们建设更能适应变化的城市。",
      changeReason: "拆分长句，把抽象表述改为更直接的说明。",
      reviewStatus: "pending",
      comments: [],
    },
    {
      id: "block-h2",
      type: "heading",
      headingLevel: 2,
      text: "一、水从哪里来",
      accessibleText: "一、水从哪里来",
      changeReason: "保留原章节结构。",
      reviewStatus: "approved",
      comments: [],
    },
    {
      id: "block-img",
      type: "image",
      text: "图 3-1 城市水循环示意",
      imageSrc: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='420'%3E%3Crect width='800' height='420' fill='%23dcecf3'/%3E%3Ccircle cx='650' cy='85' r='45' fill='%23f4c95d'/%3E%3Cpath d='M0 300 Q180 240 340 300 T800 280 V420 H0Z' fill='%2389b7d0'/%3E%3Cpath d='M130 285 Q220 170 330 285' fill='none' stroke='%233a7c9e' stroke-width='12'/%3E%3C/svg%3E",
      imageAlt: "",
      accessibleText: "",
      changeReason: "",
      reviewStatus: "needs-work",
      comments: [],
    },
    {
      id: "block-p2",
      type: "paragraph",
      text: "当太阳照射到水面时，水会受热变成水蒸气升到空中。水蒸气冷却后形成云，再以雨或雪的形式落回地面。",
      accessibleText: "太阳照在水面上，水会变成水蒸气升到空中。水蒸气冷却后变成云，最后以雨或雪落回地面。",
      changeReason: "使用较短句子，并明确每个步骤的先后顺序。",
      reviewStatus: "approved",
      comments: [],
    },
    {
      id: "block-link",
      type: "link",
      text: "点击这里",
      linkHref: "/resources/water-cycle",
      accessibleText: "打开水循环互动实验",
      changeReason: "改为说明链接目标的独立文案。",
      reviewStatus: "pending",
      comments: [],
    },
    {
      id: "block-h3",
      type: "heading",
      headingLevel: 3,
      text: "雨水花园怎样工作",
      accessibleText: "雨水花园怎样工作",
      changeReason: "",
      reviewStatus: "approved",
      comments: [],
    },
    {
      id: "block-p3",
      type: "paragraph",
      text: "雨水花园利用土壤和植物的共同作用暂时储存雨水，同时通过下渗补给地下水，并在降雨较集中时减轻城市排水管道所承受的压力。",
      accessibleText: "雨水花园用土壤和植物暂时存住雨水。雨水还会慢慢渗入地下，补充地下水。雨很大时，它可以减轻排水管的压力。",
      changeReason: "把并列成分拆成短句，减少专业术语密度。",
      reviewStatus: "pending",
      comments: [],
    },
  ];

  return {
    id: "accessible-textbook-1009",
    title: "科学（五年级下册）·无障碍改写稿",
    subject: "科学",
    grade: "五年级",
    blocks,
    glossary: [
      { id: "term-1", source: "水循环", preferred: "水循环", note: "全书统一使用" },
      { id: "term-2", source: "地表径流", preferred: "沿地面流动的水", note: "首次出现时使用通俗解释" },
      { id: "term-3", source: "下渗", preferred: "渗入地下", note: "避免单独使用专业词" },
    ],
    versions: [],
    reviewBatches: [],
    updatedAt: new Date().toISOString(),
  };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function parseImportedChapter(input: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  const lines = input.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  for (const line of lines) {
    const heading = /^(#{1,6})\s+(.+)$/.exec(line);
    if (heading) {
      blocks.push(blankBlock("heading", heading[2], { headingLevel: heading[1].length }));
      continue;
    }
    const image = /^!\[([^\]]*)\]\(([^)]+)\)(?:\s+(.+))?$/.exec(line);
    if (image) {
      blocks.push(blankBlock("image", image[3] || "未命名图片", { imageSrc: image[2], imageAlt: image[1] }));
      continue;
    }
    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(line);
    if (link) {
      blocks.push(blankBlock("link", link[1], { linkHref: link[2] }));
      continue;
    }
    blocks.push(blankBlock("paragraph", line));
  }
  return blocks.length ? blocks : [blankBlock("paragraph", input.trim() || "请输入章节内容")];
}

function blankBlock(type: BlockType, text: string, extra: Partial<ContentBlock> = {}): ContentBlock {
  return {
    id: uid("block"),
    type,
    text,
    accessibleText: type === "image" ? extra.imageAlt ?? "" : text,
    changeReason: "",
    reviewStatus: "pending",
    comments: [],
    ...extra,
  };
}

function sentenceLength(text: string) {
  const normalized = text.replace(/\s+/g, "");
  return /[A-Za-z]/.test(text) ? text.trim().split(/\s+/).length : normalized.length;
}

function analyze(project: ChapterProject): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];
  let lastHeading = 0;
  for (const block of project.blocks) {
    if (block.type === "heading") {
      const level = block.headingLevel ?? 2;
      if (lastHeading && level > lastHeading + 1) {
        issues.push({
          id: `heading-${block.id}`,
          blockId: block.id,
          type: "heading",
          severity: "error",
          title: "标题层级跳跃",
          detail: `从 H${lastHeading} 直接到 H${level}，读屏用户会失去清晰的章节结构。`,
          suggestion: `改为 H${lastHeading + 1}，或补上中间的上级标题。`,
        });
      }
      lastHeading = level;
    }
    if (block.type === "image" && !(block.imageAlt ?? block.accessibleText).trim()) {
      issues.push({
        id: `image-${block.id}`,
        blockId: block.id,
        type: "image",
        severity: "error",
        title: "图片缺少替代文本",
        detail: "视觉用户能看到的图表信息，读屏用户目前无法获得。",
        suggestion: "说明图中主体、变化和结论；纯装饰图片应标记为空替代文本。",
      });
    }
    if (block.type === "link") {
      const label = block.accessibleText || block.text;
      if (/^(点击这里|这里|链接|更多|here|click here|read more)$/i.test(label.trim())) {
        issues.push({
          id: `link-${block.id}`,
          blockId: block.id,
          type: "link",
          severity: "error",
          title: "链接文案缺少目的",
          detail: `“${label}”单独朗读时无法说明会前往哪里。`,
          suggestion: "改成“打开水循环互动实验”等可独立理解的文案。",
        });
      }
    }
    const text = block.type === "image" ? block.text : block.text;
    const sentences = text.split(/(?<=[。！？!?])\s*/).filter(Boolean);
    for (const [index, sentence] of sentences.entries()) {
      if (sentenceLength(sentence) > (/[A-Za-z]/.test(sentence) ? 28 : 42)) {
        issues.push({
          id: `sentence-${block.id}-${index}`,
          blockId: block.id,
          type: "sentence",
          severity: "warning",
          title: "句子过长",
          detail: `该句约 ${sentenceLength(sentence)} ${/[A-Za-z]/.test(sentence) ? "个词" : "个字"}，一次理解的信息较多。`,
          suggestion: "按动作或因果关系拆成 2—3 个短句。",
        });
      }
    }
    const source = `${block.text} ${block.accessibleText}`;
    for (const term of project.glossary) {
      if (source.includes(term.source) && block.accessibleText && !block.accessibleText.includes(term.preferred)) {
        issues.push({
          id: `term-${block.id}-${term.id}`,
          blockId: block.id,
          type: "glossary",
          severity: "info",
          title: `术语“${term.source}”尚未统一`,
          detail: `全书建议表述为“${term.preferred}”。${term.note}`,
          suggestion: `将无障碍文本调整为“${term.preferred}”。`,
        });
      }
    }
  }
  return issues;
}

/**
 * 只有标题层级、图片说明（替代文本/图注）、链接文案这三类发布前高风险字段
 * 才会触发“回到待复核”。正文与改写原因的修改不改变签名。
 */
function reviewSignature(block: ContentBlock) {
  if (block.type === "heading") return `heading:${block.headingLevel ?? 2}`;
  if (block.type === "image") return `image:${block.imageAlt ?? ""}::${block.text}`;
  if (block.type === "link") return `link:${block.accessibleText || block.text}`;
  return "";
}

function snapshotBlock(block: ContentBlock): BlockSnapshot {
  return {
    id: block.id,
    type: block.type,
    text: block.text,
    accessibleText: block.accessibleText,
    headingLevel: block.headingLevel,
    imageSrc: block.imageSrc,
    imageAlt: block.imageAlt,
    linkHref: block.linkHref,
    changeReason: block.changeReason,
    reviewStatus: block.reviewStatus,
  };
}

function snapshotIssue(issue: AccessibilityIssue, blocks: ContentBlock[]): IssueSnapshot {
  const order = blocks.findIndex((block) => block.id === issue.blockId);
  const owner = blocks.find((block) => block.id === issue.blockId);
  return {
    id: issue.id,
    blockId: issue.blockId,
    type: issue.type,
    severity: issue.severity,
    title: issue.title,
    detail: issue.detail,
    suggestion: issue.suggestion,
    blockLabel: `段 ${order >= 0 ? order + 1 : "?"} · ${typeLabel(owner?.type ?? "paragraph", owner?.headingLevel)}`,
  };
}

interface BatchEvaluation {
  resolved: IssueSnapshot[];
  added: AccessibilityIssue[];
  withdrawnActive: IssueWithdrawal[];
  withdrawnMissing: IssueWithdrawal[];
  /** 当前仍实际存在、且未被撤回的问题 */
  remaining: AccessibilityIssue[];
  blockingErrors: AccessibilityIssue[];
  recheckBlocks: ContentBlock[];
}

function evaluateBatch(batch: ReviewBatch, current: ChapterProject): BatchEvaluation {
  const currentIssues = analyze(current);
  const currentById = new Map(currentIssues.map((issue) => [issue.id, issue]));
  const baselineIds = new Set(batch.baseline.issues.map((issue) => issue.id));
  const withdrawals = new Map(batch.withdrawals.map((item) => [item.issueId, item]));

  const resolved: IssueSnapshot[] = [];
  const remaining: AccessibilityIssue[] = [];
  const withdrawnActive: IssueWithdrawal[] = [];
  const withdrawnMissing: IssueWithdrawal[] = [];

  for (const baselineIssue of batch.baseline.issues) {
    if (!currentById.has(baselineIssue.id)) {
      if (withdrawals.has(baselineIssue.id)) withdrawnMissing.push(withdrawals.get(baselineIssue.id)!);
      else resolved.push(baselineIssue);
    }
  }
  for (const issue of currentIssues) {
    if (withdrawals.has(issue.id)) {
      withdrawnActive.push(withdrawals.get(issue.id)!);
    } else {
      remaining.push(issue);
    }
  }
  const added = currentIssues.filter((issue) => !baselineIds.has(issue.id) && !withdrawals.has(issue.id));
  const blockingErrors = remaining.filter((issue) => issue.severity === "error");
  const recheckBlocks = batch.recheckBlockIds
    .map((id) => current.blocks.find((block) => block.id === id))
    .filter((block): block is ContentBlock => Boolean(block));

  return { resolved, added, withdrawnActive, withdrawnMissing, remaining, blockingErrors, recheckBlocks };
}

function dispositionNote(
  outcome: IssueOutcome,
  snapshot: { title: string; detail: string; suggestion: string },
  withdrawalReason?: string,
) {
  if (outcome === "resolved") {
    return `已按建议处理并通过复查：${snapshot.suggestion}`;
  }
  if (outcome === "withdrawn") {
    return `复核撤回（不作为导出阻断）：${withdrawalReason || "编辑确认无需处理"}`;
  }
  return `复核中新出现的问题，尚待处理：${snapshot.detail}`;
}

function buildBatchReport(batch: ReviewBatch, evaluation: BatchEvaluation): BatchReport {
  const current = project;
  const currentById = new Map(analyze(current).map((issue) => [issue.id, issue]));
  const indexOf = (blockId: string) => current.blocks.findIndex((block) => block.id === blockId);
  const currentLabel = (issue: AccessibilityIssue) =>
    `段 ${indexOf(issue.blockId) + 1} · ${blockRole(current.blocks.find((block) => block.id === issue.blockId) ?? current.blocks[0])}`;

  return {
    resolved: evaluation.resolved.map((issue) => ({
      issueId: issue.id,
      outcome: "resolved" as const,
      title: issue.title,
      severity: issue.severity,
      blockId: issue.blockId,
      blockLabel: issue.blockLabel,
      note: dispositionNote("resolved", issue),
    })),
    added: evaluation.added.map((issue) => ({
      issueId: issue.id,
      outcome: "new" as const,
      title: issue.title,
      severity: issue.severity,
      blockId: issue.blockId,
      blockLabel: currentLabel(issue),
      note: dispositionNote("new", issue),
    })),
    withdrawn: [...evaluation.withdrawnActive, ...evaluation.withdrawnMissing].map((withdrawal) => {
      const baseline = batch.baseline.issues.find((issue) => issue.id === withdrawal.issueId);
      const live = currentById.get(withdrawal.issueId);
      const title = baseline?.title ?? live?.title ?? "已撤回的问题";
      const severity = baseline?.severity ?? live?.severity ?? "warning";
      const blockId = baseline?.blockId ?? live?.blockId ?? "";
      const blockLabel = baseline?.blockLabel ?? (live ? currentLabel(live) : "（内容块已删除）");
      const detail = baseline?.detail ?? live?.detail ?? "";
      const suggestion = baseline?.suggestion ?? live?.suggestion ?? "";
      return {
        issueId: withdrawal.issueId,
        outcome: "withdrawn" as const,
        title,
        severity,
        blockId,
        blockLabel,
        note: dispositionNote("withdrawn", { title, detail, suggestion }, withdrawal.reason),
      };
    }),
  };
}

function simplifyText(input: string, glossary: GlossaryTerm[]) {
  let result = input
    .replaceAll("由于其", "因为")
    .replaceAll("因此", "所以")
    .replaceAll("具有十分重要的意义", "很重要")
    .replaceAll("利用", "使用")
    .replaceAll("共同作用", "一起作用")
    .replaceAll("暂时储存", "暂时存住")
    .replaceAll("所承受的压力", "受到的压力")
    .replace(/([^。！？]{38,}?)[，、]([^。！？]{12,}?[。！？])/g, "$1。$2");
  for (const term of glossary) {
    if (result.includes(term.source)) result = result.replaceAll(term.source, term.preferred);
  }
  result = result
    .split(/(?<=[。！？!?])\s*/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
    .join("\n");
  return result;
}

function blockRole(block: ContentBlock) {
  return typeLabel(block.type, block.headingLevel);
}

function typeLabel(type: BlockType, headingLevel?: number) {
  if (type === "heading") return `H${headingLevel ?? 2} 标题`;
  if (type === "image") return "图片 / 替代文本";
  if (type === "link") return "链接";
  return "正文段落";
}

function statusLabel(status: ReviewStatus) {
  if (status === "approved") return "已通过";
  if (status === "needs-work") return "需修改";
  return "待审核";
}

function severityLabel(severity: Severity) {
  if (severity === "error") return "必须修复";
  if (severity === "warning") return "建议优化";
  return "一致性提醒";
}

function exportHtml(project: ChapterProject) {
  const body = project.blocks.map((block) => {
    if (block.type === "heading") {
      const level = Math.min(6, Math.max(1, block.headingLevel ?? 2));
      return `<h${level}>${escapeHtml(block.accessibleText || block.text)}</h${level}>`;
    }
    if (block.type === "image") {
      return `<figure><img src="${escapeHtml(block.imageSrc ?? "")}" alt="${escapeHtml(block.imageAlt || block.accessibleText)}"><figcaption>${escapeHtml(block.text)}</figcaption></figure>`;
    }
    if (block.type === "link") {
      return `<p><a href="${escapeHtml(block.linkHref ?? "#")}">${escapeHtml(block.accessibleText || block.text)}</a></p>`;
    }
    return `<p>${escapeHtml(block.accessibleText || block.text)}</p>`;
  }).join("\n      ");
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(project.title)} · 无障碍版本</title>
  <style>
    :root { font-family: "Noto Sans SC", sans-serif; font-size: 20px; line-height: 1.85; color: #17231f; background: #fffdf7; }
    body { max-width: 760px; margin: 0 auto; padding: 32px 24px 80px; }
    a { color: #075c9d; text-decoration-thickness: 2px; text-underline-offset: 3px; }
    a:focus-visible, [tabindex]:focus-visible { outline: 4px solid #d08a00; outline-offset: 3px; }
    h1, h2, h3, h4, h5, h6 { line-height: 1.4; margin-top: 1.8em; }
    figure { margin: 2em 0; } img { max-width: 100%; height: auto; } figcaption { font-size: .86em; color: #46554f; }
    .skip { position: absolute; left: -9999px; } .skip:focus { position: static; display: inline-block; padding: .5em; background: #fff; }
  </style>
</head>
<body>
  <a class="skip" href="#main">跳到正文</a>
  <main id="main" tabindex="-1">
      ${body}
  </main>
</body>
</html>`;
}

function download(filename: string, content: string, type = "text/html;charset=utf-8") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function loadProject(): ChapterProject {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "") as { schema: number; project: ChapterProject };
    if (stored.schema === 1 && stored.project?.blocks?.length) {
      const loaded = stored.project;
      loaded.reviewBatches ??= [];
      loaded.versions ??= [];
      loaded.glossary ??= [];
      for (const batch of loaded.reviewBatches) {
        batch.recheckBlockIds ??= [];
        batch.withdrawals ??= [];
      }
      // 若上一会话的批次没来得及关闭，保持其打开状态。
      if (activeBatchId === "" && loaded.reviewBatches.some((batch) => !batch.closedAt)) {
        activeBatchId = loaded.reviewBatches.find((batch) => !batch.closedAt)!.id;
      }
      return loaded;
    }
  } catch {
    // Fall back to the bundled sample.
  }
  return createSeedProject();
}

const rootElement = document.querySelector<HTMLDivElement>("#app");
if (!rootElement) throw new Error("Application root was not found");
const app: HTMLDivElement = rootElement;

let activeBatchId = "";
let project = loadProject();
let activeBlockId = project.blocks[0]?.id ?? "";
let activeIssueId = "";
let previewMode: "normal" | "assisted" = "normal";
let selectedVersionId = "";
let showGlossary = false;
let undoStack: ChapterProject[] = [];
let redoStack: ChapterProject[] = [];
let saveTimer = 0;
let batchDialogOpen = false;
let withdrawIssueId = "";
let gateOpen = false;
let historyBatchId = "";
let closeBatchNote = "";
let closeBatchError = "";
let withdrawReason = "";
let withdrawError = "";

const activeBlock = () => project.blocks.find((block) => block.id === activeBlockId) ?? project.blocks[0];
const issues = () => analyze(project);
const activeBatch = () => project.reviewBatches.find((batch) => batch.id === activeBatchId && !batch.closedAt);

function syncActiveBatchId() {
  if (activeBatchId && project.reviewBatches.some((batch) => batch.id === activeBatchId && !batch.closedAt)) return;
  activeBatchId = project.reviewBatches.find((batch) => !batch.closedAt)?.id ?? "";
}

function saveSoon() {
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ schema: 1, project }));
  }, 320);
}

function commit(label: string, update: (draft: ChapterProject) => void, renderAfter = true) {
  undoStack = [...undoStack.slice(-49), structuredClone(project)];
  redoStack = [];
  const draft = structuredClone(project);
  update(draft);
  draft.updatedAt = new Date().toISOString();
  project = draft;
  document.documentElement.dataset.lastAction = label;
  saveSoon();
  if (renderAfter) render();
}

function undo() {
  const previous = undoStack.pop();
  if (!previous) return;
  redoStack = [structuredClone(project), ...redoStack].slice(0, 50);
  project = previous;
  if (!project.blocks.some((block) => block.id === activeBlockId)) activeBlockId = project.blocks[0]?.id ?? "";
  syncActiveBatchId();
  saveSoon();
  render();
}

function redo() {
  const next = redoStack.shift();
  if (!next) return;
  undoStack = [...undoStack.slice(-49), structuredClone(project)];
  project = next;
  syncActiveBatchId();
  saveSoon();
  render();
}

/**
 * @param contentEdit 是否为内容编辑。批次进行中只有签名变化（标题层级/图片说明/链接文案）
 *                    才把内容块打回待复核；批次外保持原有行为（任何编辑都回到待审核）。
 *                    审核状态、批注等操作传 false，绝不覆盖状态。
 */
function updateActiveBlock(
  update: (block: ContentBlock, draft: ChapterProject) => void,
  label = "修改无障碍文本",
  renderAfter = true,
  contentEdit = false,
) {
  const before = project.blocks.find((item) => item.id === activeBlockId);
  const signatureBefore = before ? reviewSignature(before) : "";
  const batch = activeBatch();
  commit(label, (draft) => {
    const block = draft.blocks.find((item) => item.id === activeBlockId);
    if (block) update(block, draft);
    if (block && contentEdit) {
      const signatureAfter = reviewSignature(block);
      if (batch) {
        if (signatureBefore !== signatureAfter) {
          block.reviewStatus = "pending";
          const draftBatch = draft.reviewBatches.find((item) => item.id === batch.id);
          if (draftBatch && !draftBatch.recheckBlockIds.includes(block.id)) draftBatch.recheckBlockIds.push(block.id);
        }
      } else {
        block.reviewStatus = "pending";
      }
    }
  }, renderAfter);
}

function saveVersion(draft: ChapterProject, label: string, now = new Date()) {
  const versionId = uid("version");
  draft.versions.unshift({
    id: versionId,
    label,
    createdAt: now.toISOString(),
    blocks: structuredClone(draft.blocks),
    glossary: structuredClone(draft.glossary),
  });
  // 裁剪到 10 个版本时，进行中批次引用的基线版本不能被挤掉。
  const protectedIds = new Set(
    draft.reviewBatches.filter((batch) => !batch.closedAt).map((batch) => batch.baseline.versionId),
  );
  const kept: VersionSnapshot[] = [];
  for (const item of draft.versions) {
    if (kept.length < 10 || protectedIds.has(item.id)) kept.push(item);
  }
  draft.versions = kept;
  return versionId;
}

function startBatch() {
  if (activeBatch() || project.reviewBatches.some((batch) => !batch.closedAt)) return;
  const now = new Date();
  const label = `发布复核 ${now.getMonth() + 1}月${now.getDate()}日 ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const versionLabel = `复核基线 · ${label}`;
  const snapshot = structuredClone(project);
  const baselineIssues = analyze(snapshot).map((issue) => snapshotIssue(issue, snapshot.blocks));
  let versionId = "";
  let batchId = "";
  commit("开始发布复核批次", (draft) => {
    versionId = saveVersion(draft, versionLabel, now);
    batchId = uid("batch");
    draft.reviewBatches.unshift({
      id: batchId,
      label,
      startedAt: now.toISOString(),
      baseline: {
        issues: baselineIssues,
        blocks: draft.blocks.map(snapshotBlock),
        versionId,
        versionLabel,
      },
      recheckBlockIds: [],
      withdrawals: [],
    });
    draft.reviewBatches = draft.reviewBatches.slice(0, 20);
  });
  activeBatchId = batchId;
  selectedVersionId = versionId;
  historyBatchId = "";
  batchDialogOpen = true;
  closeBatchNote = "";
  closeBatchError = "";
  render();
}

function closeBatch() {
  const batch = activeBatch();
  if (!batch) return;
  const note = closeBatchNote.trim();
  if (!note) {
    closeBatchError = "请先填写本轮发布复核的处理说明。";
    render();
    return;
  }
  const evaluation = evaluateBatch(batch, project);
  const report = buildBatchReport(batch, evaluation);
  if (evaluation.blockingErrors.length) {
    closeBatchError = `仍有 ${evaluation.blockingErrors.length} 个必须修复的问题未处理，导出会被拦截；请先修复，或在问题列表中逐条说明撤回理由。`;
    render();
    return;
  }
  commit("关闭发布复核批次", (draft) => {
    const target = draft.reviewBatches.find((item) => item.id === batch.id);
    if (!target) return;
    target.closedAt = new Date().toISOString();
    target.closeNote = note;
    target.report = report;
  });
  activeBatchId = "";
  closeBatchError = "";
  closeBatchNote = "";
  historyBatchId = batch.id;
  batchDialogOpen = true;
  render();
}

function reopenBatch(batchId: string) {
  if (project.reviewBatches.some((batch) => !batch.closedAt)) return;
  commit("重新打开发布复核批次", (draft) => {
    const target = draft.reviewBatches.find((item) => item.id === batchId);
    if (!target || !target.closedAt) return;
    target.reopenedAt = new Date().toISOString();
    target.closedAt = undefined;
    target.closeNote = undefined;
    target.report = undefined;
  });
  activeBatchId = batchId;
  closeBatchError = "";
  closeBatchNote = "";
  render();
}

function confirmWithdrawIssue() {
  const batch = activeBatch();
  if (!batch || !withdrawIssueId) return;
  const reason = withdrawReason.trim();
  if (reason.length < 2) {
    withdrawError = "请填写撤回理由（至少 2 个字），关闭批次时会一并记录。";
    render();
    return;
  }
  const issueId = withdrawIssueId;
  commit("撤回问题", (draft) => {
    const target = draft.reviewBatches.find((item) => item.id === batch.id);
    if (!target) return;
    target.withdrawals = target.withdrawals.filter((item) => item.issueId !== issueId);
    target.withdrawals.push({ issueId, reason, createdAt: new Date().toISOString() });
  });
  withdrawIssueId = "";
  withdrawReason = "";
  withdrawError = "";
  render();
}

function tryExport() {
  const batch = activeBatch();
  const currentErrors = issues().filter((issue) => issue.severity === "error");
  const withdrawnIds = new Set((batch?.withdrawals ?? []).map((item) => item.issueId));
  const blockingErrors = currentErrors.filter((issue) => !withdrawnIds.has(issue.id));
  if (blockingErrors.length) {
    gateOpen = true;
    render();
    return;
  }
  download(`${project.title}-无障碍版.html`, exportHtml(project));
  document.documentElement.dataset.lastAction = "已导出无障碍 HTML";
  render();
}

function outcomeLabel(outcome: IssueOutcome) {
  if (outcome === "resolved") return "已解决";
  if (outcome === "new") return "新增";
  return "已撤回";
}

function renderDispositionList(items: IssueDisposition[], emptyText: string) {
  if (!items.length) return `<div class="empty-note">${emptyText}</div>`;
  return `<div class="disposition-list">${items.map((item) => `
    <div class="disposition ${item.outcome}">
      <div><span class="outcome-tag ${item.outcome}">${outcomeLabel(item.outcome)}</span><sl-badge variant="${item.severity === "error" ? "danger" : item.severity === "warning" ? "warning" : "primary"}">${severityLabel(item.severity)}</sl-badge><b>${escapeHtml(item.title)}</b><span class="block-label">${escapeHtml(item.blockLabel)}</span></div>
      <p>${escapeHtml(item.note)}</p>
    </div>`).join("")}</div>`;
}

function renderOpenBatch(batch: ReviewBatch) {
  const evaluation = evaluateBatch(batch, project);
  const remainingById = new Map(evaluation.remaining.map((issue) => [issue.id, issue]));
  const withdrawnSet = new Set(batch.withdrawals.map((item) => item.issueId));
  const baselineRows = batch.baseline.issues.map((issue) => {
    const status = withdrawnSet.has(issue.id)
      ? `<span class="outcome-tag withdrawn">已撤回</span>`
      : remainingById.has(issue.id)
        ? `<span class="outcome-tag new">未解决</span>`
        : `<span class="outcome-tag resolved">已解决</span>`;
    return `<div class="baseline-issue">${status}<div><b>${escapeHtml(issue.title)}</b><small>${escapeHtml(issue.blockLabel)} · ${escapeHtml(issue.detail)}</small></div></div>`;
  }).join("") || `<div class="empty-note">基线中没有问题。</div>`;
  const recheckRows = evaluation.recheckBlocks.map((block) => {
    const order = project.blocks.findIndex((item) => item.id === block.id) + 1;
    return `<div class="recheck-row"><b>${order} · ${blockRole(block)}</b><span>${escapeHtml(block.accessibleText || block.text || "（空）")}</span><i class="status-${block.reviewStatus}">${statusLabel(block.reviewStatus)}</i><sl-button size="small" variant="default" data-action="select-block" data-block-id="${block.id}">定位</sl-button></div>`;
  }).join("") || `<div class="empty-note">还没有块因为修改标题层级、图片说明或链接文案而回到待复核。</div>`;
  const withdrawalRows = batch.withdrawals.map((item) => {
    const baseline = batch.baseline.issues.find((issue) => issue.id === item.issueId);
    const live = issues().find((issue) => issue.id === item.issueId);
    return `<div class="disposition withdrawn"><div><b>${escapeHtml(baseline?.title ?? live?.title ?? item.issueId)}</b></div><p>撤回理由：${escapeHtml(item.reason)}</p><small>${new Date(item.createdAt).toLocaleString()}</small></div>`;
  }).join("") || `<div class="empty-note">没有撤回记录。</div>`;
  const addedRows = evaluation.added.map((issue) => {
    const order = project.blocks.findIndex((block) => block.id === issue.blockId) + 1;
    return `<div class="baseline-issue"><span class="outcome-tag new">新增</span><div><b>${escapeHtml(issue.title)}</b><small>段 ${order} · ${escapeHtml(issue.detail)}</small><sl-button size="small" variant="default" data-action="jump-issue" data-issue-id="${issue.id}" data-block-id="${issue.blockId}">定位</sl-button></div></div>`;
  }).join("") || `<div class="empty-note">本轮没有引入新问题。</div>`;

  return `<div class="batch-body">
    <div class="batch-meta">
      <div><b>${escapeHtml(batch.label)}</b><small>开始于 ${new Date(batch.startedAt).toLocaleString()}${batch.reopenedAt ? ` · 曾于 ${new Date(batch.reopenedAt).toLocaleString()} 重新打开` : ""}</small></div>
      <div class="batch-chips">
        <sl-badge variant="neutral">基线问题 ${batch.baseline.issues.length}</sl-badge>
        <sl-badge variant="neutral">基线内容块 ${batch.baseline.blocks.length}</sl-badge>
        <sl-badge variant="success">已解决 ${evaluation.resolved.length}</sl-badge>
        <sl-badge variant="warning">新增 ${evaluation.added.length}</sl-badge>
        <sl-badge variant="neutral">撤回 ${batch.withdrawals.length}</sl-badge>
        <sl-badge variant="danger">必修未清 ${evaluation.blockingErrors.length}</sl-badge>
      </div>
      <small class="baseline-version">对照基线版本：${escapeHtml(batch.baseline.versionLabel)}（可在右侧“版本比较”中查看）</small>
    </div>
    <section class="batch-section"><h3>回到待复核的内容块（${evaluation.recheckBlocks.length}）</h3><p class="section-hint">只有实际改到标题层级、图片说明或链接文案的块才会回到待复核。</p><div class="recheck-list">${recheckRows}</div></section>
    <section class="batch-section"><h3>基线问题处理情况（${batch.baseline.issues.length}）</h3><div class="baseline-list">${baselineRows}</div></section>
    <section class="batch-section"><h3>本轮新增问题（${evaluation.added.length}）</h3><div class="baseline-list">${addedRows}</div></section>
    <section class="batch-section"><h3>撤回记录（${batch.withdrawals.length}）</h3><div class="disposition-list">${withdrawalRows}</div></section>
    <section class="batch-close">
      <label class="field-label" for="close-note">关闭批次处理说明（必填）</label>
      <sl-textarea id="close-note" rows="3" value="${escapeHtml(closeBatchNote)}" placeholder="说明本轮复核范围、主要修复内容、撤回问题的依据，以及遗留风险。"></sl-textarea>
      ${closeBatchError ? `<div class="form-error">${escapeHtml(closeBatchError)}</div>` : ""}
      <sl-button variant="warning" data-action="close-batch">关闭批次并生成报告</sl-button>
    </section>
  </div>`;
}

function renderClosedBatch(batch: ReviewBatch) {
  const report = batch.report ?? { resolved: [], added: [], withdrawn: [] };
  const anotherOpen = Boolean(activeBatch());
  return `<div class="batch-body">
    <div class="batch-meta">
      <div><b>${escapeHtml(batch.label)}</b><small>${new Date(batch.startedAt).toLocaleString()} 开始 · ${batch.closedAt ? new Date(batch.closedAt).toLocaleString() : ""} 关闭${batch.reopenedAt ? ` · ${new Date(batch.reopenedAt).toLocaleString()} 重新打开后复查` : ""}</small></div>
      <div class="batch-chips">
        <sl-badge variant="success">已解决 ${report.resolved.length}</sl-badge>
        <sl-badge variant="warning">新增 ${report.added.length}</sl-badge>
        <sl-badge variant="neutral">撤回 ${report.withdrawn.length}</sl-badge>
      </div>
      <small class="baseline-version">基线版本：${escapeHtml(batch.baseline.versionLabel)}</small>
    </div>
    <section class="batch-section"><h3>关闭时处理说明</h3><div class="close-note-box">${escapeHtml(batch.closeNote ?? "")}</div></section>
    <section class="batch-section"><h3>已解决问题（${report.resolved.length}）</h3>${renderDispositionList(report.resolved, "无")}</section>
    <section class="batch-section"><h3>新增问题（${report.added.length}）</h3>${renderDispositionList(report.added, "无")}</section>
    <section class="batch-section"><h3>撤回问题（${report.withdrawn.length}）</h3>${renderDispositionList(report.withdrawn, "无")}</section>
    <div class="batch-footer-actions">
      <sl-button variant="default" data-action="batch-history-list">返回批次历史</sl-button>
      <sl-button variant="primary" data-action="reopen-batch" data-batch-id="${batch.id}" ${anotherOpen ? "disabled" : ""}>${anotherOpen ? "有批次进行中，暂不能重开" : "重新打开此批次继续复核"}</sl-button>
    </div>
  </div>`;
}

function renderBatchHistoryList() {
  const closed = project.reviewBatches.filter((batch) => batch.closedAt);
  if (!closed.length) {
    return `<div class="batch-body">
      <div class="batch-start-card">
        <h3>还没有发布复核批次</h3>
        <p>开始批次时会冻结当前问题、内容块快照，并保存一个“复核基线”版本。批次进行中，只有改到标题层级、图片说明或链接文案的内容块会回到待复核；关闭时会对照基线列出已解决、新增和撤回的问题。仍有“必须修复”问题时，导出入口会拦截。</p>
        <sl-button variant="primary" data-action="start-batch">开始发布复核批次</sl-button>
      </div>
    </div>`;
  }
  return `<div class="batch-body">
    <div class="history-list">${closed.map((batch) => {
      const report = batch.report ?? { resolved: [], added: [], withdrawn: [] };
      return `<div class="history-item">
        <div><b>${escapeHtml(batch.label)}</b><small>${new Date(batch.startedAt).toLocaleString()} → ${batch.closedAt ? new Date(batch.closedAt).toLocaleString() : ""}</small></div>
        <div class="history-counts"><span class="resolved">已解决 ${report.resolved.length}</span><span class="new">新增 ${report.added.length}</span><span class="withdrawn">撤回 ${report.withdrawn.length}</span></div>
        <sl-button size="small" variant="default" data-action="view-history-batch" data-batch-id="${batch.id}">查看 / 重新打开</sl-button>
      </div>`;
    }).join("")}</div>
  </div>`;
}

function renderBatchDialogs() {
  const batch = activeBatch();
  let dialogLabel = "发布复核批次";
  let body: string;
  if (batch) {
    dialogLabel = `发布复核批次 · ${batch.label}`;
    body = renderOpenBatch(batch);
  } else if (historyBatchId) {
    const historyBatch = project.reviewBatches.find((item) => item.id === historyBatchId);
    body = historyBatch && historyBatch.closedAt
      ? renderClosedBatch(historyBatch)
      : renderBatchHistoryList();
  } else {
    body = renderBatchHistoryList();
  }
  return `<sl-dialog label="${escapeHtml(dialogLabel)}" ${batchDialogOpen ? "open" : ""} data-dialog="batch" class="batch-dialog">${body}
    <sl-button slot="footer" variant="default" data-action="close-batch-dialog">${batch ? "收起（批次继续进行）" : "关闭"}</sl-button>
    ${batch ? `<sl-button slot="footer" variant="warning" data-action="close-batch">关闭批次并生成报告</sl-button>` : `<sl-button slot="footer" variant="primary" data-action="start-batch">开始发布复核批次</sl-button>`}
  </sl-dialog>`;
}

function renderWithdrawDialog() {
  if (!withdrawIssueId) return "";
  const batch = activeBatch();
  const issue = issues().find((item) => item.id === withdrawIssueId)
    ?? batch?.baseline.issues.find((item) => item.id === withdrawIssueId);
  if (!batch || !issue) return "";
  return `<sl-dialog label="撤回问题" open data-dialog="withdraw" class="small-dialog">
    <p class="withdraw-target"><sl-badge variant="${issue.severity === "error" ? "danger" : issue.severity === "warning" ? "warning" : "primary"}">${severityLabel(issue.severity)}</sl-badge><b>${escapeHtml(issue.title)}</b></p>
    <p class="section-hint">撤回后该问题不再阻断导出，撤回理由会写入批次关闭报告。请确认不是必须修复的无障碍缺陷。</p>
    <sl-textarea id="withdraw-reason" rows="3" value="${escapeHtml(withdrawReason)}" placeholder="例如：该图为纯装饰图，已用空替代文本处理；检查规则误报。"></sl-textarea>
    ${withdrawError ? `<div class="form-error">${escapeHtml(withdrawError)}</div>` : ""}
    <sl-button slot="footer" variant="default" data-action="cancel-withdraw">取消</sl-button>
    <sl-button slot="footer" variant="primary" data-action="confirm-withdraw">确认撤回</sl-button>
  </sl-dialog>`;
}

function renderGateDialog() {
  if (!gateOpen) return "";
  const batch = activeBatch();
  const withdrawnSet = new Set((batch?.withdrawals ?? []).map((item) => item.issueId));
  const blocking = issues().filter((issue) => issue.severity === "error" && !withdrawnSet.has(issue.id));
  return `<sl-dialog label="导出被拦截：仍有必须修复的问题" open data-dialog="gate" class="gate-dialog">
    <p class="section-hint">${batch ? `批次「${escapeHtml(batch.label)}」尚未清零。` : ""}以下 ${blocking.length} 个问题会影响读屏用户使用，必须修复后才能导出；如确属误报，可${batch ? "在问题列表中说明理由后撤回" : "先开始发布复核批次再撤回"}。</p>
    <div class="gate-list">${blocking.map((issue) => {
      const order = project.blocks.findIndex((block) => block.id === issue.blockId) + 1;
      const block = project.blocks.find((item) => item.id === issue.blockId);
      return `<div class="gate-item">
        <div><b>${escapeHtml(issue.title)}</b><small>段 ${order} · ${block ? escapeHtml(blockRole(block)) : ""} · ${escapeHtml(issue.detail)}</small></div>
        <sl-button size="small" variant="default" data-action="gate-jump" data-issue-id="${issue.id}" data-block-id="${issue.blockId}">定位块</sl-button>
      </div>`;
    }).join("")}</div>
    <sl-button slot="footer" variant="primary" data-action="close-gate">去处理</sl-button>
  </sl-dialog>`;
}

function render() {
  const list = issues();
  const active = activeBlock();
  const activeIssues = list.filter((issue) => issue.blockId === active.id);
  const approved = project.blocks.filter((block) => block.reviewStatus === "approved").length;
  const version = project.versions.find((item) => item.id === selectedVersionId) ?? project.versions[0];

  const batch = activeBatch();
  const batchEvaluation = batch ? evaluateBatch(batch, project) : null;
  const withdrawnIds = new Set((batch?.withdrawals ?? []).map((item) => item.issueId));
  const visibleErrors = list.filter((issue) => issue.severity === "error" && !withdrawnIds.has(issue.id));

  app.innerHTML = `
    <div class="app-shell">
      <header class="topbar">
        <div class="brand"><span>无障碍</span><b>1009</b></div>
        <div class="title-block">
          <input id="project-title" aria-label="教材名称" value="${escapeHtml(project.title)}" />
          <div class="meta"><span>${escapeHtml(project.subject)}</span><span>${escapeHtml(project.grade)}</span><span class="save-dot">本地自动保存</span></div>
        </div>
        <div class="top-actions">
          <span class="online-pill">${navigator.onLine ? "在线" : "离线可编辑"}</span>
          <sl-button size="small" variant="default" ${undoStack.length ? "" : "disabled"} data-action="undo">撤销</sl-button>
          <sl-button size="small" variant="default" ${redoStack.length ? "" : "disabled"} data-action="redo">重做</sl-button>
          <sl-button size="small" variant="default" data-action="glossary">术语表</sl-button>
          <sl-button size="small" variant="default" data-action="save-version">保存版本</sl-button>
          <sl-button size="small" variant="${batch ? "warning" : "default"}" data-action="open-batch">${batch ? `复核进行中 · ${batchEvaluation?.blockingErrors.length ?? 0} 必修` : "发布复核批次"}</sl-button>
          <sl-button size="small" variant="success" data-action="export">导出无障碍 HTML</sl-button>
        </div>
      </header>

      <div class="progress-strip">
        <div class="progress-copy"><b>${approved}/${project.blocks.length}</b><span>内容块已审核通过</span></div>
        <div class="progress-bar"><i style="width:${Math.round((approved / Math.max(1, project.blocks.length)) * 100)}%"></i></div>
        <div class="issue-counts">
          <span class="error">${visibleErrors.length} 必须修复</span>
          <span class="warning">${list.filter((issue) => issue.severity === "warning").length} 建议优化</span>
          <span class="info">${list.filter((issue) => issue.severity === "info").length} 术语提醒</span>
        </div>
      </div>

      ${batch && batchEvaluation ? `<div class="batch-strip">
        <span class="batch-dot"></span>
        <b>${escapeHtml(batch.label)}</b>
        <span>复核进行中：基线 ${batch.baseline.issues.length} 个问题 · 已解决 ${batchEvaluation.resolved.length} · 新增 ${batchEvaluation.added.length} · 撤回 ${batch.withdrawals.length} · 回到待复核 ${batchEvaluation.recheckBlocks.length} 块</span>
        <sl-button size="small" variant="warning" outline data-action="open-batch">打开复核批次</sl-button>
      </div>` : ""}

      <div class="workspace">
        <aside class="outline-panel">
          <div class="panel-title"><span>章节结构</span><sl-badge>${project.blocks.length} 块</sl-badge></div>
          <div class="block-list">
            ${project.blocks.map((block, index) => {
              const blockIssues = list.filter((issue) => issue.blockId === block.id);
              const inRecheck = batch?.recheckBlockIds.includes(block.id) ?? false;
              return `<button class="block-item ${block.id === active.id ? "active" : ""} ${inRecheck ? "recheck" : ""}" data-action="select-block" data-block-id="${block.id}">
                <span class="block-order">${index + 1}</span>
                <span class="block-copy"><b>${block.type === "heading" ? `H${block.headingLevel}` : blockRole(block)}</b><span>${escapeHtml(block.accessibleText || block.text || "（空）")}</span></span>
                <i class="status-${block.reviewStatus}" title="${statusLabel(block.reviewStatus)}"></i>
                ${inRecheck ? `<span class="recheck-badge" title="本轮复核中修改了标题层级、图片说明或链接文案，需重新复核">复核</span>` : ""}
                ${blockIssues.length ? `<em>${blockIssues.length}</em>` : ""}
              </button>`;
            }).join("")}
          </div>
          <input id="chapter-file" type="file" accept=".txt,.md,.markdown" hidden />
          <sl-button class="import-button" variant="default" data-action="import">导入章节文本</sl-button>
          <div class="keyboard-note"><b>键盘</b><span><kbd>J</kbd><kbd>K</kbd> 跳转问题</span><span><kbd>E</kbd> 自动改写</span><span><kbd>⌘ Z</kbd> 撤销</span><span><kbd>1</kbd><kbd>2</kbd> 预览模式</span></div>
        </aside>

        <main class="editor-panel">
          <div class="editor-head">
            <div><span class="eyebrow">当前内容块</span><h1>${blockRole(active)}</h1></div>
            <div class="review-actions">
              <sl-button size="small" variant="${active.reviewStatus === "approved" ? "success" : "default"}" data-action="approve">${active.reviewStatus === "approved" ? "✓ 已通过" : "审核通过"}</sl-button>
              <sl-button size="small" variant="${active.reviewStatus === "needs-work" ? "danger" : "default"}" data-action="needs-work">需修改</sl-button>
            </div>
          </div>

          ${activeIssues.length ? `<div class="active-issues">${activeIssues.map((issue) => `
            <div class="issue-card ${issue.severity} ${withdrawnIds.has(issue.id) ? "withdrawn" : ""}">
              <div><sl-badge variant="${issue.severity === "error" ? "danger" : issue.severity === "warning" ? "warning" : "primary"}">${severityLabel(issue.severity)}</sl-badge><strong>${escapeHtml(issue.title)}</strong>${withdrawnIds.has(issue.id) ? `<sl-badge variant="neutral">已撤回</sl-badge>` : ""}</div>
              <p>${escapeHtml(issue.detail)}</p><small>${escapeHtml(issue.suggestion)}</small>
            </div>`).join("")}</div>` : `<div class="issue-clear">✓ 当前内容块没有新的无障碍问题</div>`}

          <section class="edit-card source-card">
            <div class="section-heading"><div><span class="eyebrow">原教材</span><h2>${active.type === "image" ? "图片信息" : active.type === "link" ? "链接信息" : "原文"}</h2></div><sl-badge variant="neutral">${active.type}</sl-badge></div>
            ${renderSourceEditor(active)}
          </section>

          <section class="edit-card rewrite-card">
            <div class="section-heading">
              <div><span class="eyebrow">Accessible rewrite</span><h2>无障碍表达</h2></div>
              <sl-button size="small" variant="primary" outline data-action="generate">生成易读版本</sl-button>
            </div>
            ${renderAccessibleEditor(active)}
            <label class="field-label" for="reason-${active.id}">改写原因（每处改写必须记录）</label>
            <sl-textarea id="reason-${active.id}" data-field="reason" rows="2" value="${escapeHtml(active.changeReason)}" placeholder="例如：拆分长句、替换专业表达、补充链接目的"></sl-textarea>
          </section>

          <section class="edit-card">
            <div class="section-heading"><div><span class="eyebrow">Review discussion</span><h2>批注与回复</h2></div><sl-badge variant="warning">${active.comments.length} 条</sl-badge></div>
            <div class="comment-compose"><sl-textarea id="new-comment" rows="2" placeholder="记录改写依据、审核意见或术语讨论…"></sl-textarea><sl-button size="small" variant="primary" data-action="add-comment">添加批注</sl-button></div>
            <div class="comment-list">
              ${active.comments.length ? active.comments.map((comment) => `
                <article class="comment ${comment.resolved ? "resolved" : ""}">
                  <header><b>${escapeHtml(comment.author)}</b><time>${new Date(comment.createdAt).toLocaleString()}</time></header>
                  <p>${escapeHtml(comment.body)}</p>
                  ${comment.replies.map((reply) => `<div class="reply"><b>${escapeHtml(reply.author)}</b><span>${escapeHtml(reply.body)}</span></div>`).join("")}
                  <div class="reply-row"><sl-input size="small" id="reply-${comment.id}" placeholder="回复…"></sl-input><sl-button size="small" data-action="reply" data-comment-id="${comment.id}">回复</sl-button><sl-button size="small" variant="text" data-action="resolve-comment" data-comment-id="${comment.id}">${comment.resolved ? "重新打开" : "解决"}</sl-button></div>
                </article>`).join("") : `<div class="empty-note">当前内容块还没有批注。</div>`}
            </div>
          </section>
        </main>

        <aside class="review-panel">
          <section class="preview-card">
            <div class="section-heading"><div><span class="eyebrow">Reader preview</span><h2>阅读预览</h2></div><div class="mode-switch"><button class="${previewMode === "normal" ? "active" : ""}" data-action="preview-normal">普通</button><button class="${previewMode === "assisted" ? "active" : ""}" data-action="preview-assisted">辅助</button></div></div>
            <div class="reader-preview mode-${previewMode}">${renderPreview()}</div>
          </section>

          <section class="order-card">
            <div class="section-heading"><div><span class="eyebrow">Screen reader order</span><h2>读屏阅读顺序</h2></div><sl-badge>从上到下</sl-badge></div>
            <ol class="reading-order">
              ${project.blocks.map((block, index) => `<li class="${block.id === active.id ? "active" : ""}"><b>${index + 1}</b><div><strong>${blockRole(block)}</strong><span>${escapeHtml(block.accessibleText || block.text || "（无内容）")}</span></div></li>`).join("")}
            </ol>
          </section>

          <section class="issues-panel">
            <div class="section-heading"><div><span class="eyebrow">All checks</span><h2>全章问题</h2></div><sl-button size="small" variant="default" outline data-action="approve-all">全部通过</sl-button></div>
            <div class="issue-list">
              ${list.length ? list.map((issue) => {
                const withdrawn = withdrawnIds.has(issue.id);
                const reason = batch?.withdrawals.find((item) => item.issueId === issue.id)?.reason ?? "";
                return `<div class="issue-row ${issue.severity} ${issue.id === activeIssueId ? "active" : ""} ${withdrawn ? "withdrawn" : ""}">
                  <button data-action="jump-issue" data-issue-id="${issue.id}" data-block-id="${issue.blockId}">
                    <span>${severityLabel(issue.severity)}${withdrawn ? " · 已撤回" : ""}</span>
                    <b>${escapeHtml(issue.title)}</b>
                    <small>段 ${project.blocks.findIndex((block) => block.id === issue.blockId) + 1} · ${escapeHtml(issue.suggestion)}</small>
                    ${withdrawn ? `<small class="withdraw-note">撤回理由：${escapeHtml(reason)}</small>` : ""}
                  </button>
                  ${batch ? (withdrawn
                    ? `<sl-button size="small" variant="text" data-action="restore-issue" data-issue-id="${issue.id}">恢复</sl-button>`
                    : `<sl-button size="small" variant="text" data-action="ask-withdraw" data-issue-id="${issue.id}">撤回</sl-button>`) : ""}
                </div>`;
              }).join("") : `<div class="issue-clear">✓ 全章检查通过</div>`}
            </div>
          </section>

          <section class="version-card">
            <div class="section-heading"><div><span class="eyebrow">Version compare</span><h2>版本比较</h2></div><sl-badge>${project.versions.length} 版</sl-badge></div>
            ${project.versions.length ? `
              <sl-select id="version-select" size="small" value="${version?.id ?? ""}">${project.versions.map((item) => `<sl-option value="${item.id}">${escapeHtml(item.label)} · ${new Date(item.createdAt).toLocaleTimeString()}</sl-option>`).join("")}</sl-select>
              <div class="version-diff">${version ? renderVersionDiff(version, active) : ""}</div>
            ` : `<div class="empty-note">保存版本后，可比较改写前后的无障碍文本。</div>`}
          </section>
        </aside>
      </div>

      <footer class="statusbar"><span>最近操作：${escapeHtml(document.documentElement.dataset.lastAction || "示例章节已载入")}</span><span>${project.blocks.length} 个内容块 · ${list.length} 个待处理问题</span></footer>
    </div>

    <sl-dialog label="全书术语表" ${showGlossary ? "open" : ""} data-dialog="glossary">
      <div class="glossary-editor">
        ${project.glossary.map((term) => `<div class="term-row"><div><b>${escapeHtml(term.source)}</b><sl-input size="small" value="${escapeHtml(term.preferred)}" data-term-id="${term.id}"></sl-input><small>${escapeHtml(term.note)}</small></div><sl-button size="small" variant="danger" outline data-action="remove-term" data-term-id="${term.id}">删除</sl-button></div>`).join("")}
      </div>
      <div class="term-add"><sl-input id="new-term-source" placeholder="原文术语"></sl-input><sl-input id="new-term-preferred" placeholder="统一表达"></sl-input><sl-button variant="primary" data-action="add-term">添加术语</sl-button></div>
      <sl-button slot="footer" variant="primary" data-action="close-glossary">完成</sl-button>
    </sl-dialog>
    ${renderBatchDialogs()}
    ${renderWithdrawDialog()}
    ${renderGateDialog()}`;

  wireLiveFields();
}

function renderSourceEditor(block: ContentBlock) {
  if (block.type === "image") {
    return `<div class="image-source"><img src="${escapeHtml(block.imageSrc ?? "")}" alt="" /><div><b>图注</b><p>${escapeHtml(block.text)}</p><b>现有替代文本</b><p>${escapeHtml(block.imageAlt || "（空）")}</p></div></div>
      <sl-input id="source-${block.id}" data-field="source" label="图注" value="${escapeHtml(block.text)}"></sl-input>
      <sl-input id="image-alt-${block.id}" data-field="image-alt" label="替代文本" value="${escapeHtml(block.imageAlt ?? "")}" help-text="描述图片传达的信息，不写“图片”二字。"></sl-input>`;
  }
  if (block.type === "link") {
    return `<sl-input id="source-${block.id}" data-field="source" label="原链接文案" value="${escapeHtml(block.text)}"></sl-input><sl-input id="link-href-${block.id}" data-field="link-href" label="链接地址" value="${escapeHtml(block.linkHref ?? "")}"></sl-input>`;
  }
  if (block.type === "heading") {
    return `<div class="heading-edit"><sl-select id="heading-level-${block.id}" data-field="heading-level" label="标题层级" value="${String(block.headingLevel ?? 2)}"><sl-option value="1">H1</sl-option><sl-option value="2">H2</sl-option><sl-option value="3">H3</sl-option><sl-option value="4">H4</sl-option></sl-select><sl-input id="source-${block.id}" data-field="source" label="标题文本" value="${escapeHtml(block.text)}"></sl-input></div>`;
  }
  return `<sl-textarea id="source-${block.id}" data-field="source" rows="4" value="${escapeHtml(block.text)}"></sl-textarea>`;
}

function renderAccessibleEditor(block: ContentBlock) {
  if (block.type === "image") {
    return `<sl-textarea id="accessible-${block.id}" data-field="accessible" rows="3" label="图片替代文本" value="${escapeHtml(block.imageAlt || block.accessibleText)}" help-text="读屏软件会朗读这里的内容。"></sl-textarea>`;
  }
  return `<sl-textarea id="accessible-${block.id}" data-field="accessible" rows="6" value="${escapeHtml(block.accessibleText)}"></sl-textarea>`;
}

function renderPreview() {
  return project.blocks.map((block, index) => {
    const content = escapeHtml(block.accessibleText || block.text);
    if (block.type === "heading") {
      const tag = `h${Math.min(6, Math.max(1, block.headingLevel ?? 2))}`;
      return `<${tag} class="${block.id === activeBlockId ? "active-block" : ""}"><span class="order-marker">${index + 1}</span>${content}</${tag}>`;
    }
    if (block.type === "image") {
      return `<figure class="${block.id === activeBlockId ? "active-block" : ""}"><img src="${escapeHtml(block.imageSrc ?? "")}" alt="${escapeHtml(block.imageAlt || block.accessibleText)}"><figcaption><span class="order-marker">${index + 1}</span>${escapeHtml(block.text)}</figcaption></figure>`;
    }
    if (block.type === "link") {
      return `<p class="${block.id === activeBlockId ? "active-block" : ""}"><span class="order-marker">${index + 1}</span><a href="${escapeHtml(block.linkHref ?? "#")}" onclick="return false">${content}</a><span class="link-role">链接</span></p>`;
    }
    return `<p class="${block.id === activeBlockId ? "active-block" : ""}"><span class="order-marker">${index + 1}</span>${content}</p>`;
  }).join("");
}

function renderVersionDiff(version: VersionSnapshot, current: ContentBlock) {
  const oldBlock = version.blocks.find((block) => block.id === current.id);
  if (!oldBlock) return `<div class="empty-note">当前内容块不在该版本中。</div>`;
  return `<div class="diff-column"><span>旧版</span><p>${escapeHtml(oldBlock.accessibleText || oldBlock.text)}</p></div><div class="diff-column current"><span>当前</span><p>${escapeHtml(current.accessibleText || current.text)}</p></div>`;
}

function wireLiveFields() {
  app.querySelectorAll<HTMLElement>("sl-input[data-field], sl-textarea[data-field], sl-select[data-field]").forEach((element) => {
    element.addEventListener("sl-input", () => {
      const value = (element as HTMLElement & { value: string }).value;
      updateActiveBlock((block) => {
        const field = element.dataset.field;
        if (field === "source") block.text = value;
        if (field === "accessible") {
          block.accessibleText = value;
          if (block.type === "image") block.imageAlt = value;
        }
        if (field === "image-alt") {
          block.imageAlt = value;
          block.accessibleText = value;
        }
        if (field === "link-href") block.linkHref = value;
        if (field === "reason") block.changeReason = value;
      }, "编辑无障碍文本", false, true);
    });
    element.addEventListener("sl-change", () => render());
  });
}

app.addEventListener("click", (event) => {
  const target = (event.target as HTMLElement).closest<HTMLElement>("[data-action]");
  if (!target) return;
  const action = target.dataset.action;
  if (action === "undo") undo();
  if (action === "redo") redo();
  if (action === "select-block") {
    activeBlockId = target.dataset.blockId ?? activeBlockId;
    activeIssueId = "";
    render();
  }
  if (action === "jump-issue") {
    activeIssueId = target.dataset.issueId ?? "";
    activeBlockId = target.dataset.blockId ?? activeBlockId;
    render();
    requestAnimationFrame(() => app.querySelector<HTMLElement>(".editor-panel")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }
  if (action === "generate") {
    const block = activeBlock();
    const suggestion = block.type === "link"
      ? "打开水循环互动实验"
      : simplifyText(block.type === "image" ? block.imageAlt || block.text : block.text, project.glossary);
    updateActiveBlock((current) => {
      if (current.type === "image") current.imageAlt = suggestion;
      current.accessibleText = suggestion;
      current.changeReason ||= "拆分长句并替换复杂表达，保留原有知识信息。";
    }, "生成易读版本", true, true);
  }
  if (action === "approve") updateActiveBlock((block) => { block.reviewStatus = "approved"; }, "审核通过");
  if (action === "needs-work") updateActiveBlock((block) => { block.reviewStatus = "needs-work"; }, "标记需修改");
  if (action === "add-comment") {
    const input = app.querySelector<HTMLElement & { value: string }>("#new-comment");
    const body = input?.value.trim();
    if (body) updateActiveBlock((block) => {
      block.comments.unshift({ id: uid("comment"), author: "当前编辑", body, createdAt: new Date().toISOString(), resolved: false, replies: [] });
    }, "添加批注");
  }
  if (action === "reply") {
    const commentId = target.dataset.commentId ?? "";
    const input = app.querySelector<HTMLElement & { value: string }>(`#reply-${CSS.escape(commentId)}`);
    const body = input?.value.trim();
    if (body) updateActiveBlock((block) => {
      block.comments.find((comment) => comment.id === commentId)?.replies.push({ id: uid("reply"), author: "当前编辑", body, createdAt: new Date().toISOString() });
    }, "回复批注");
  }
  if (action === "resolve-comment") {
    const commentId = target.dataset.commentId ?? "";
    updateActiveBlock((block) => {
      const comment = block.comments.find((item) => item.id === commentId);
      if (comment) comment.resolved = !comment.resolved;
    }, "更新批注状态");
  }
  if (action === "preview-normal") { previewMode = "normal"; render(); }
  if (action === "preview-assisted") { previewMode = "assisted"; render(); }
  if (action === "glossary") { showGlossary = true; render(); }
  if (action === "close-glossary") { showGlossary = false; render(); }
  if (action === "add-term") {
    const source = app.querySelector<HTMLElement & { value: string }>("#new-term-source");
    const preferred = app.querySelector<HTMLElement & { value: string }>("#new-term-preferred");
    if (source?.value.trim() && preferred?.value.trim()) {
      commit("添加术语", (draft) => { draft.glossary.push({ id: uid("term"), source: source.value.trim(), preferred: preferred.value.trim(), note: "编辑新增术语" }); });
    }
  }
  if (action === "remove-term") {
    const termId = target.dataset.termId;
    commit("删除术语", (draft) => { draft.glossary = draft.glossary.filter((term) => term.id !== termId); });
  }
  if (action === "save-version") {
    let versionId = "";
    commit("保存版本快照", (draft) => {
      versionId = saveVersion(draft, `版本 ${draft.versions.length + 1}`);
    });
    selectedVersionId = versionId;
    render();
  }
  if (action === "approve-all") {
    commit("全部审核通过", (draft) => { draft.blocks.forEach((block) => { block.reviewStatus = "approved"; }); });
  }
  if (action === "export") {
    tryExport();
  }
  if (action === "import") app.querySelector<HTMLInputElement>("#chapter-file")?.click();
  if (action === "open-batch") {
    historyBatchId = "";
    batchDialogOpen = true;
    render();
  }
  if (action === "start-batch") startBatch();
  if (action === "close-batch") closeBatch();
  if (action === "close-batch-dialog") { batchDialogOpen = false; render(); }
  if (action === "reopen-batch") reopenBatch(target.dataset.batchId ?? "");
  if (action === "view-history-batch") { historyBatchId = target.dataset.batchId ?? ""; batchDialogOpen = true; render(); }
  if (action === "batch-history-list") { historyBatchId = ""; render(); }
  if (action === "ask-withdraw") {
    withdrawIssueId = target.dataset.issueId ?? "";
    withdrawReason = "";
    withdrawError = "";
    render();
  }
  if (action === "cancel-withdraw") { withdrawIssueId = ""; withdrawError = ""; render(); }
  if (action === "confirm-withdraw") confirmWithdrawIssue();
  if (action === "restore-issue") {
    const batch = activeBatch();
    const issueId = target.dataset.issueId ?? "";
    if (batch) commit("恢复问题", (draft) => {
      const targetBatch = draft.reviewBatches.find((item) => item.id === batch.id);
      if (targetBatch) targetBatch.withdrawals = targetBatch.withdrawals.filter((item) => item.issueId !== issueId);
    });
  }
  if (action === "close-gate") { gateOpen = false; render(); }
  if (action === "gate-jump") {
    gateOpen = false;
    activeIssueId = target.dataset.issueId ?? "";
    activeBlockId = target.dataset.blockId ?? activeBlockId;
    render();
    requestAnimationFrame(() => app.querySelector<HTMLElement>(".editor-panel")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }
});

app.addEventListener("sl-change", (event) => {
  const element = event.target as HTMLElement;
  if (element.id === "chapter-file") return;
  if (element.id.startsWith("heading-level-")) {
    const level = Number((element as HTMLElement & { value: string }).value);
    updateActiveBlock((block) => { block.headingLevel = level; }, "修改标题层级", true, true);
  }
  if (element.id === "version-select") {
    selectedVersionId = (element as HTMLElement & { value: string }).value;
    render();
  }
  if (element.matches("[data-term-id]")) {
    const termId = element.dataset.termId;
    const value = (element as HTMLElement & { value: string }).value;
    commit("修改术语表", (draft) => { const term = draft.glossary.find((item) => item.id === termId); if (term) term.preferred = value; });
  }
});

app.addEventListener("change", (event) => {
  const input = event.target as HTMLInputElement;
  if (input.id !== "chapter-file" || !input.files?.[0]) return;
  void input.files[0].text().then((text) => {
    commit("导入章节文本", (draft) => {
      draft.blocks = parseImportedChapter(text);
      activeBlockId = draft.blocks[0]?.id ?? "";
      activeIssueId = "";
    });
  });
});

app.addEventListener("input", (event) => {
  const input = event.target as HTMLInputElement;
  if (input.id === "project-title") {
    project.title = input.value;
    saveSoon();
  }
});

app.addEventListener("sl-input", (event) => {
  const element = event.target as HTMLElement & { value: string };
  if (element.id === "close-note") {
    closeBatchNote = element.value;
    closeBatchError = "";
  }
  if (element.id === "withdraw-reason") {
    withdrawReason = element.value;
    withdrawError = "";
  }
});

app.addEventListener("sl-hide", (event) => {
  const element = event.target as HTMLElement;
  const dialogName = element.dataset.dialog;
  if (!dialogName) return;
  if (dialogName === "batch") batchDialogOpen = false;
  if (dialogName === "withdraw") { withdrawIssueId = ""; withdrawError = ""; }
  if (dialogName === "gate") gateOpen = false;
  if (dialogName === "glossary") showGlossary = false;
});

window.addEventListener("online", render);
window.addEventListener("offline", render);
window.addEventListener("keydown", (event) => {
  const target = event.target as HTMLElement;
  if (target.matches("input, textarea, sl-input, sl-textarea, [contenteditable='true']")) return;
  const command = event.metaKey || event.ctrlKey;
  if (command && event.key.toLowerCase() === "z") {
    event.preventDefault();
    event.shiftKey ? redo() : undo();
    return;
  }
  if (command && event.key.toLowerCase() === "s") {
    event.preventDefault();
    let versionId = "";
    commit("键盘保存版本", (draft) => { versionId = saveVersion(draft, `版本 ${draft.versions.length + 1}`); });
    selectedVersionId = versionId;
    return;
  }
  if (event.key.toLowerCase() === "j" || event.key.toLowerCase() === "k") {
    const list = issues();
    if (!list.length) return;
    const current = Math.max(0, list.findIndex((issue) => issue.id === activeIssueId));
    const next = (current + (event.key.toLowerCase() === "j" ? 1 : -1) + list.length) % list.length;
    activeIssueId = list[next].id;
    activeBlockId = list[next].blockId;
    render();
  }
  if (event.key.toLowerCase() === "e") {
    const button = app.querySelector<HTMLElement>('[data-action="generate"]');
    button?.click();
  }
  if (event.key === "1") { previewMode = "normal"; render(); }
  if (event.key === "2") { previewMode = "assisted"; render(); }
});

render();
