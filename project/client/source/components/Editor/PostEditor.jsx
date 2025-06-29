import { forwardRef, memo, useImperativeHandle, useRef } from "react";
import MetaBlock from "./Blocks/MetaBlock";
import ListBlock from "./ListBlock";
import "./PostEditor.css";

const PostEditor = forwardRef(({ initState, onChange }, ref) => {

    const metaRef = useRef();
    const blockRef = useRef();

    useImperativeHandle(ref, () => ({
        getContent() {
            const validMeta = metaRef.current?.validateMeta?.();
            const validBlocks = blockRef.current?.validateAllBlocks?.();
            if (!validMeta || !validBlocks) return false;

            const metaData = metaRef.current?.getMeta?.() || {};
            const blocksData = blockRef.current?.getAllBlocks?.() || [];

            return {
                ...initState,
                meta: metaData,
                content: blocksData
            };
        }
    }));

    return (
        <div className="posteditor-container">
            <MetaBlock
                initialMeta={initState?.meta || {}}
                onChange={onChange}
                ref={metaRef}
            />

            <ListBlock
                ref={blockRef}
                onChange={onChange}
                initialBlocks={initState?.content || []}
            />
        </div>
    );
});

export default memo(PostEditor);