declare namespace _default {
    namespace meta {
        let type: "problem";
        let fixable: "code";
        namespace docs {
            let description: string;
            let recommended: boolean;
            let url: string;
        }
        namespace messages {
            let unknownAtRule: string;
            let invalidPrelude: string;
            let unknownDescriptor: string;
            let invalidDescriptor: string;
            let invalidExtraPrelude: string;
            let missingPrelude: string;
            let invalidCharsetSyntax: string;
        }
    }
    function create(context: import("@eslint/core").RuleContext<{
        LangOptions: import("../index.js").CSSLanguageOptions;
        Code: import("../index.js").CSSSourceCode;
        RuleOptions: [];
        Node: import("@eslint/css-tree").CssNodePlain;
        MessageIds: NoInvalidAtRulesMessageIds;
    }>): {
        Atrule(node: AtrulePlain): void;
        "AtRule > Block > Declaration"(node: any): void;
    };
}
export default _default;
export type NoInvalidAtRulesMessageIds = "unknownAtRule" | "invalidPrelude" | "unknownDescriptor" | "invalidDescriptor" | "invalidExtraPrelude" | "missingPrelude" | "invalidCharsetSyntax";
export type NoInvalidAtRulesRuleDefinition = CSSRuleDefinition<{
    RuleOptions: [];
    MessageIds: NoInvalidAtRulesMessageIds;
}>;
import type { AtrulePlain } from "@eslint/css-tree";
import type { CSSRuleDefinition } from "../types.js";
