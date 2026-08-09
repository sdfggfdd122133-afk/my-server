declare namespace _default {
    namespace meta {
        let type: "problem";
        let hasSuggestions: true;
        namespace docs {
            let description: string;
            let url: string;
        }
        let schema: {
            type: "object";
            properties: {
                allowProperties: {
                    type: "array";
                    items: {
                        enum: string[];
                    };
                    uniqueItems: true;
                };
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
            allowProperties: any[];
            allowUnits: any[];
        }];
        namespace messages {
            let notLogicalProperty: string;
            let notLogicalValue: string;
            let notLogicalUnit: string;
            let replaceWithLogicalProperty: string;
            let replaceWithLogicalValue: string;
            let replaceWithLogicalUnit: string;
        }
    }
    function create(context: import("@eslint/core").RuleContext<{
        LangOptions: import("../index.js").CSSLanguageOptions;
        Code: import("../index.js").CSSSourceCode;
        RuleOptions: PreferLogicalPropertiesOptions;
        Node: import("@eslint/css-tree").CssNodePlain;
        MessageIds: PreferLogicalPropertiesMessageIds;
    }>): {
        Declaration(node: import("@eslint/css-tree").DeclarationPlain): void;
        Dimension(node: import("@eslint/css-tree").Dimension): void;
    };
}
export default _default;
export type PreferLogicalPropertiesMessageIds = "notLogicalProperty" | "notLogicalValue" | "notLogicalUnit" | "replaceWithLogicalProperty" | "replaceWithLogicalValue" | "replaceWithLogicalUnit";
export type PreferLogicalPropertiesOptions = [{
    allowProperties?: string[];
    allowUnits?: string[];
}];
export type PreferLogicalPropertiesRuleDefinition = CSSRuleDefinition<{
    RuleOptions: PreferLogicalPropertiesOptions;
    MessageIds: PreferLogicalPropertiesMessageIds;
}>;
import type { CSSRuleDefinition } from "../types.js";
