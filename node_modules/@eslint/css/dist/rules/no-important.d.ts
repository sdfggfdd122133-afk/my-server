declare namespace _default {
    namespace meta {
        let type: "problem";
        let hasSuggestions: true;
        namespace docs {
            let description: string;
            let recommended: boolean;
            let url: string;
        }
        namespace messages {
            let unexpectedImportant: string;
            let removeImportant: string;
        }
    }
    function create(context: import("@eslint/core").RuleContext<{
        LangOptions: import("../index.js").CSSLanguageOptions;
        Code: import("../index.js").CSSSourceCode;
        RuleOptions: [];
        Node: import("@eslint/css-tree").CssNodePlain;
        MessageIds: NoImportantMessageIds;
    }>): {
        Declaration(node: import("@eslint/css-tree").DeclarationPlain): void;
    };
}
export default _default;
export type NoImportantMessageIds = "unexpectedImportant" | "removeImportant";
export type NoImportantRuleDefinition = CSSRuleDefinition<{
    RuleOptions: [];
    MessageIds: NoImportantMessageIds;
}>;
import type { CSSRuleDefinition } from "../types.js";
