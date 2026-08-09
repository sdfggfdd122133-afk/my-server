declare namespace _default {
    namespace meta {
        let type: "problem";
        namespace docs {
            let description: string;
            let recommended: boolean;
            let url: string;
        }
        let schema: {
            type: "object";
            properties: {
                allowUnknownVariables: {
                    type: "boolean";
                };
            };
            additionalProperties: false;
        }[];
        let defaultOptions: [{
            allowUnknownVariables: false;
        }];
        namespace messages {
            let invalidPropertyValue: string;
            let unknownProperty: string;
            let unknownVar: string;
        }
    }
    function create(context: import("@eslint/core").RuleContext<{
        LangOptions: import("../index.js").CSSLanguageOptions;
        Code: import("../index.js").CSSSourceCode;
        RuleOptions: NoInvalidPropertiesOptions;
        Node: import("@eslint/css-tree").CssNodePlain;
        MessageIds: NoInvalidPropertiesMessageIds;
    }>): {
        "Rule > Block Declaration"(): void;
        "Rule > Block Declaration > Value > *:not(Function)"(node: any): void;
        Function(): void;
        "Function > *:not(Function)"(node: any): void;
        "Function:exit"(node: FunctionNodePlain): void;
        "Rule > Block Declaration:exit"(node: any): void;
    };
}
export default _default;
export type NoInvalidPropertiesMessageIds = "invalidPropertyValue" | "unknownProperty" | "unknownVar";
export type NoInvalidPropertiesOptions = [{
    allowUnknownVariables?: boolean;
}];
export type NoInvalidPropertiesRuleDefinition = CSSRuleDefinition<{
    RuleOptions: NoInvalidPropertiesOptions;
    MessageIds: NoInvalidPropertiesMessageIds;
}>;
import type { FunctionNodePlain } from "@eslint/css-tree";
import type { CSSRuleDefinition } from "../types.js";
