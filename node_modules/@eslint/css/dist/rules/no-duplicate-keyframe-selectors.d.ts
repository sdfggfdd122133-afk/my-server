declare namespace _default {
    namespace meta {
        let type: "problem";
        namespace docs {
            let description: string;
            let recommended: boolean;
            let url: string;
        }
        namespace messages {
            let duplicateKeyframeSelector: string;
        }
    }
    function create(context: import("@eslint/core").RuleContext<{
        LangOptions: import("../index.js").CSSLanguageOptions;
        Code: import("../index.js").CSSSourceCode;
        RuleOptions: [];
        Node: import("@eslint/css-tree").CssNodePlain;
        MessageIds: "duplicateKeyframeSelector";
    }>): {
        "Atrule[name=/^(-(o|moz|webkit)-)?keyframes$/i]"(): void;
        "Atrule[name=/^(-(o|moz|webkit)-)?keyframes$/i]:exit"(): void;
        Rule(node: import("@eslint/css-tree").RulePlain): void;
    };
}
export default _default;
export type DuplicateKeyframeSelectorMessageIds = "duplicateKeyframeSelector";
export type DuplicateKeyframeSelectorRuleDefinition = CSSRuleDefinition<{
    RuleOptions: [];
    MessageIds: DuplicateKeyframeSelectorMessageIds;
}>;
import type { CSSRuleDefinition } from "../types.js";
