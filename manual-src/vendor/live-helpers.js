// hash32 + pick: two helpers persona-module.js calls but the published site files never define.
// Copied verbatim from teamloop-live.html (lines 788-789). Without them, compile() throws for any name outside the 129.
function hash32(value){let h=2166136261;for(const ch of String(value)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function pick(items,seed){return items[seed%items.length]}
