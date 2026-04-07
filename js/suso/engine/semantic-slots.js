/**
 * Semantic slot projection from phrase matches + light regex cues.
 * Slots are the bridge to routing/domain — keep them structured, not chat-shaped.
 *
 * Slot keys intentionally support both product hosts (LCM) and world hosts (game):
 * intent, questionType, attributes, document, entity, location, comparison, etc.
 */
export function susoBuildConfiguratorSemanticSlots(low, matches) {
  const mlow = String(low || "");
  const slots = {
    questionType: null,
    intentTag: null,
    productType: null,
    loopType: null,
    finishedPad: null,
    orientation: null,
    printType: null,
    attributes: [],
    document: null,
    domainCue: [],
    /** Named entity from phrase pack (e.g. npc). */
    entity: null,
    /** Place / hub name from phrase pack. */
    location: null,
    /** Future: tool id for agentic steps (host-defined). */
    tool: null,
    /** Future: filter spec seed (host-defined). */
    filter: null,
    /** Future: UI route or panel id (host-defined). */
    navigationTarget: null,
    comparison: false,
    targetItem: null,
  };

  if (/\b(what|which|how much|how many|list)\b/.test(mlow)) slots.questionType = "wh_question";
  else if (/\bwhy\b/.test(mlow)) slots.questionType = "why_question";
  if (/\b(show|find|tell|give|lookup|display|available)\b/.test(mlow)) slots.intentTag = "retrieve";
  if (/\b(compared to|versus|vs\.?)\b/i.test(mlow)) slots.comparison = true;

  for (const m of matches) {
    if (m.category === "product_type" && m.canonical) slots.productType = m.canonical;
    if (m.category === "loop_type" && m.canonical) slots.loopType = m.canonical;
    if (m.category === "finished_pad" && m.canonical) slots.finishedPad = m.canonical;
    if (m.category === "orientation" && m.canonical) slots.orientation = m.canonical;
    if (m.category === "print_type" && m.canonical) slots.printType = m.canonical;
    if (m.category === "attribute" && m.canonical) {
      slots.attributes.push(m.canonical);
      slots.domainCue.push("attribute:" + m.canonical);
    }
    if (m.category === "material_product" && m.canonical) {
      slots.attributes.push(m.canonical);
      slots.targetItem = slots.targetItem || m.canonical;
      slots.domainCue.push("material:" + m.canonical);
    }
    if (m.category === "document" && m.canonical) {
      slots.document = m.canonical;
      slots.domainCue.push("document:" + m.canonical);
    }
    if (m.category === "intent" && m.canonical === "export_bom") slots.intentTag = "export_bom";
    if (m.category === "npc" && m.canonical) {
      slots.entity = m.canonical;
      slots.domainCue.push("npc:" + m.canonical);
    }
    if (m.category === "location" && m.canonical) {
      slots.location = m.canonical;
      slots.domainCue.push("location:" + m.canonical);
    }
    if (m.category === "world_feature" && m.canonical) {
      slots.domainCue.push("world_feature:" + m.canonical);
    }
    if (m.category === "economy" && m.canonical) {
      slots.domainCue.push("economy:" + m.canonical);
    }
  }
  return slots;
}
