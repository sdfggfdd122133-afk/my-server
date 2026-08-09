declare namespace _default {
    namespace meta {
        let type: "problem";
        namespace docs {
            let description: string;
            let recommended: boolean;
            let url: string;
        }
        namespace messages {
            let emptyGridArea: string;
            let unevenGridArea: string;
            let nonRectangularGridArea: string;
        }
    }
    function create(context: import("@eslint/core").RuleContext<{
        LangOptions: import("../index.js").CSSLanguageOptions;
        Code: import("../index.js").CSSSourceCode;
        RuleOptions: [];
        Node: import("@eslint/css-tree").CssNodePlain;
        MessageIds: NoInvalidNamedGridAreasMessageIds;
    }>): {
        Declaration(node: import("@eslint/css-tree").DeclarationPlain): void;
    };
}
export default _default;
export type NoInvalidNamedGridAreasMessageIds = "emptyGridArea" | "unevenGridArea" | "nonRectangularGridArea";
export type NoInvalidNamedGridAreasRuleDefinition = CSSRuleDefinition<{
    RuleOptions: [];
    MessageIds: NoInvalidNamedGridAreasMessageIds;
}>;
import type { CSSRuleDefinition } from "../types.js";
