declare namespace _default {
    namespace meta {
        let type: "problem";
        let fixable: "code";
        let hasSuggestions: true;
        namespace docs {
            let description: string;
            let recommended: boolean;
            let url: string;
        }
        namespace messages {
            let duplicateImport: string;
            let removeDuplicateImportWithModifiers: string;
            let removeDuplicateImportWithoutModifiers: string;
        }
    }
    function create(context: import("@eslint/core").RuleContext<{
        LangOptions: import("../index.js").CSSLanguageOptions;
        Code: import("../index.js").CSSSourceCode;
        RuleOptions: [];
        Node: import("@eslint/css-tree").CssNodePlain;
        MessageIds: NoDuplicateKeysMessageIds;
    }>): {
        "Atrule[name=/^import$/i]"(node: any): void;
    };
}
export default _default;
export type NoDuplicateKeysMessageIds = "duplicateImport" | "removeDuplicateImportWithModifiers" | "removeDuplicateImportWithoutModifiers";
export type NoDuplicateImportsRuleDefinition = CSSRuleDefinition<{
    RuleOptions: [];
    MessageIds: NoDuplicateKeysMessageIds;
}>;
import type { CSSRuleDefinition } from "../types.js";
