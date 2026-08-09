declare namespace _default {
    namespace meta {
        let type: "problem";
        namespace docs {
            let description: string;
            let recommended: boolean;
            let url: string;
        }
        namespace messages {
            let unmatchableSelector: string;
        }
    }
    function create(context: import("@eslint/core").RuleContext<{
        LangOptions: import("../index.js").CSSLanguageOptions;
        Code: import("../index.js").CSSSourceCode;
        RuleOptions: [];
        Node: import("@eslint/css-tree").CssNodePlain;
        MessageIds: "unmatchableSelector";
    }>): {
        AnPlusB(node: import("@eslint/css-tree").AnPlusB): void;
    };
}
export default _default;
export type NoUnmatchableSelectorsMessageIds = "unmatchableSelector";
export type NoUnmatchableSelectorsRuleDefinition = CSSRuleDefinition<{
    RuleOptions: [];
    MessageIds: NoUnmatchableSelectorsMessageIds;
}>;
import type { CSSRuleDefinition } from "../types.js";
