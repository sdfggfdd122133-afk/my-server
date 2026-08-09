declare namespace _default {
    namespace meta {
        let type: "suggestion";
        namespace docs {
            let description: string;
            let recommended: boolean;
            let url: string;
        }
        namespace messages {
            let useFallbackFonts: string;
            let useGenericFont: string;
        }
    }
    function create(context: import("@eslint/core").RuleContext<{
        LangOptions: import("../index.js").CSSLanguageOptions;
        Code: import("../index.js").CSSSourceCode;
        RuleOptions: [];
        Node: import("@eslint/css-tree").CssNodePlain;
        MessageIds: FontFamilyFallbacksMessageIds;
    }>): {
        "Rule > Block > Declaration"(node: any): void;
        "Rule > Block > Declaration[property='font-family'] > Value"(node: any): void;
        "Rule > Block > Declaration[property='font'] > Value"(node: any): void;
    };
}
export default _default;
export type FontFamilyFallbacksMessageIds = "useFallbackFonts" | "useGenericFont";
export type FontFamilyFallbacksRuleDefinition = CSSRuleDefinition<{
    RuleOptions: [];
    MessageIds: FontFamilyFallbacksMessageIds;
}>;
import type { CSSRuleDefinition } from "../types.js";
