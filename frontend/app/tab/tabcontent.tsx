// Copyright 2023, Command Line Inc.
// SPDX-License-Identifier: Apache-2.0

import { Block, BlockFrame } from "@/app/block/block";
import * as services from "@/store/services";
import * as WOS from "@/store/wos";
import * as React from "react";

import { CenteredDiv, CenteredLoadingDiv } from "@/element/quickelems";
import { TileLayout } from "@/faraday/index";
import { getLayoutStateAtomForTab } from "@/faraday/lib/layoutAtom";
import { useAtomValue } from "jotai";
import { useMemo } from "react";
import { getApi } from "../store/global";
import "./tabcontent.less";

const TabContent = React.memo(({ tabId }: { tabId: string }) => {
    const oref = useMemo(() => WOS.makeORef("tab", tabId), [tabId]);
    const loadingAtom = useMemo(() => WOS.getWaveObjectLoadingAtom(oref), [oref]);
    const tabLoading = useAtomValue(loadingAtom);
    const tabAtom = useMemo(() => WOS.getWaveObjectAtom<Tab>(oref), [oref]);
    const layoutStateAtom = useMemo(() => getLayoutStateAtomForTab(tabId, tabAtom), [tabAtom, tabId]);
    const tabData = useAtomValue(tabAtom);

    const tileLayoutContents = useMemo(() => {
        function renderBlock(
            tabData: TabLayoutData,
            ready: boolean,
            onClose: () => void,
            dragHandleRef: React.RefObject<HTMLDivElement>
        ) {
            if (!tabData.blockId || !ready) {
                return null;
            }
            return (
                <Block
                    key={tabData.blockId}
                    blockId={tabData.blockId}
                    onClose={onClose}
                    dragHandleRef={dragHandleRef}
                />
            );
        }

        function renderPreview(tabData: TabLayoutData) {
            return <BlockFrame key={tabData.blockId} blockId={tabData.blockId} preview={true} />;
        }

        function onNodeDelete(data: TabLayoutData) {
            return services.ObjectService.DeleteBlock(data.blockId);
        }

        return {
            renderContent: renderBlock,
            renderPreview: renderPreview,
            tabId: tabId,
            onNodeDelete: onNodeDelete,
        };
    }, []);

    if (tabLoading) {
        return <CenteredLoadingDiv />;
    }

    if (!tabData) {
        return (
            <div className="tabcontent">
                <CenteredDiv>Tab Not Found</CenteredDiv>
            </div>
        );
    }

    if (tabData?.blockids?.length == 0) {
        return <div className="tabcontent tabcontent-empty"></div>;
    }

    return (
        <div className="tabcontent">
            <TileLayout
                key={tabId}
                contents={tileLayoutContents}
                layoutTreeStateAtom={layoutStateAtom}
                getCursorPoint={getApi().getCursorPoint}
            />
        </div>
    );
});

export { TabContent };
