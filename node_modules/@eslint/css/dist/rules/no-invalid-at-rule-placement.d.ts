declare namespace _default {
    namespace meta {
        let type: "problem";
        namespace docs {
            let description: string;
            let recommended: boolean;
            let url: string;
        }
        namespace messages {
            let invalidCharsetPlacement: string;
            let invalidImportPlacement: string;
            let invalidNamespacePlacement: string;
        }
    }
    function create(context: import("@eslint/core").RuleContext<{
        LangOptions: import("../index.js").CSSLanguageOptions;
        Code: import("../index.js").CSSSourceCode;
        RuleOptions: [];
        Node: import("@eslint/css-tree").CssNodePlain;
        MessageIds: NoInvalidAtRulePlacementMessageIds;
    }>): {
        Atrule(node: import("@eslint/css-tree").AtrulePlain): void;
        Rule(): void;
    };
}
export default _default;
export type NoInvalidAtRulePlacementMessageIds = "invalidCharsetPlacement" | "invalidImportPlacement" | "invalidNamespacePlacement";
export type NoInvalidAtRulePlacementRuleDefinition = CSSRuleDefinition<{
    RuleOptions: [];
    MessageIds: NoInvalidAtRulePlacementMessageIds;
}>;
import type { CSSRuleDefinition } from "../types.js";
