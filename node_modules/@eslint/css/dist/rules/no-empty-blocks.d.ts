declare namespace _default {
    namespace meta {
        let type: "problem";
        namespace docs {
            let description: string;
            let recommended: boolean;
            let url: string;
        }
        namespace messages {
            let emptyBlock: string;
        }
    }
    function create(context: import("@eslint/core").RuleContext<{
        LangOptions: import("../index.js").CSSLanguageOptions;
        Code: import("../index.js").CSSSourceCode;
        RuleOptions: [];
        Node: import("@eslint/css-tree").CssNodePlain;
        MessageIds: "emptyBlock";
    }>): {
        Block(node: import("@eslint/css-tree").BlockPlain): void;
    };
}
export default _default;
export type NoEmptyBlocksMessageIds = "emptyBlock";
export type NoEmptyBlocksRuleDefinition = CSSRuleDefinition<{
    RuleOptions: [];
    MessageIds: NoEmptyBlocksMessageIds;
}>;
import type { CSSRuleDefinition } from "../types.js";
