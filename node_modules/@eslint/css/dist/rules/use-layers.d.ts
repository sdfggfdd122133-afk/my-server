declare namespace _default {
    namespace meta {
        let type: "problem";
        namespace docs {
            let description: string;
            let url: string;
        }
        let schema: {
            type: "object";
            properties: {
                allowUnnamedLayers: {
                    type: "boolean";
                };
                requireImportLayers: {
                    type: "boolean";
                };
                layerNamePattern: {
                    type: "string";
                };
            };
            additionalProperties: false;
        }[];
        let defaultOptions: [{
            allowUnnamedLayers: false;
            requireImportLayers: true;
            layerNamePattern: string;
        }];
        namespace messages {
            let missingLayer: string;
            let missingLayerName: string;
            let missingImportLayer: string;
            let layerNameMismatch: string;
        }
    }
    function create(context: import("@eslint/core").RuleContext<{
        LangOptions: import("../index.js").CSSLanguageOptions;
        Code: import("../index.js").CSSSourceCode;
        RuleOptions: UseLayersOptions;
        Node: import("@eslint/css-tree").CssNodePlain;
        MessageIds: UseLayersMessageIds;
    }>): {
        "Atrule[name=/^import$/i]"(node: any): void;
        Layer(node: import("@eslint/css-tree").Layer): void;
        "Atrule[name=/^layer$/i]"(node: any): void;
        "Atrule[name=/^layer$/i]:exit"(): void;
        Rule(node: import("@eslint/css-tree").RulePlain): void;
    };
}
export default _default;
export type UseLayersMessageIds = "missingLayer" | "missingLayerName" | "missingImportLayer" | "layerNameMismatch";
export type UseLayersOptions = [{
    allowUnnamedLayers?: boolean;
    requireImportLayers?: boolean;
    layerNamePattern?: string;
}];
export type UseLayersRuleDefinition = CSSRuleDefinition<{
    RuleOptions: UseLayersOptions;
    MessageIds: UseLayersMessageIds;
}>;
import type { CSSRuleDefinition } from "../types.js";
