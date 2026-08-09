declare namespace _default {
    namespace meta {
        let type: "suggestion";
        namespace docs {
            let description: string;
            let recommended: boolean;
            let url: string;
        }
        let schema: {
            type: "object";
            properties: {
                allowUnits: {
                    type: "array";
                    items: {
                        enum: string[];
                    };
                    uniqueItems: true;
                };
            };
            additionalProperties: false;
        }[];
        let defaultOptions: [{
            allowUnits: string[];
        }];
        namespace messages {
            let allowedFontUnits: string;
        }
    }
    function create(context: import("@eslint/core").RuleContext<{
        LangOptions: import("../index.js").CSSLanguageOptions;
        Code: import("../index.js").CSSSourceCode;
        RuleOptions: RelativeFontUnitsOptions;
        Node: import("@eslint/css-tree").CssNodePlain;
        MessageIds: "allowedFontUnits";
    }>): {
        Declaration(node: import("@eslint/css-tree").DeclarationPlain): void;
    };
}
export default _default;
export type RelativeFontUnitsMessageIds = "allowedFontUnits";
export type RelativeFontUnitsOptions = [{
    allowUnits?: string[];
}];
export type RelativeFontUnitsRuleDefinition = CSSRuleDefinition<{
    RuleOptions: RelativeFontUnitsOptions;
    MessageIds: RelativeFontUnitsMessageIds;
}>;
import type { CSSRuleDefinition } from "../types.js";
