/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {DragEndEvent, DraggableCollectionProps, DragItem, DragMoveEvent, DragStartEvent} from '@react-types/shared';
import {MultipleSelectionManager} from '@react-stately/selection';
import {Key, useState} from 'react';

interface DraggableCollectionOptions extends DraggableCollectionProps {
  selectionManager: MultipleSelectionManager
}

export interface DraggableCollectionState {
  draggingKeys: Set<Key>,
  isDragging(key: Key): boolean,
  getItems(key: Key): DragItem[],
  renderPreview(key: Key): JSX.Element,
  startDrag(key: Key, event: DragStartEvent): void,
  moveDrag(event: DragMoveEvent): void,
  endDrag(event: DragEndEvent): void
}

export function useDraggableCollectionState(props: DraggableCollectionOptions): DraggableCollectionState {
  let [draggingKeys, setDraggingKeys] = useState(new Set<Key>());
  let getKeys = (key: Key) => {
    // Ensure that the item itself is always added to the drag even if not selected.
    let keys = new Set([...props.selectionManager.selectedKeys]);
    keys.add(key);
    return keys;
  };

  return {
    draggingKeys,
    isDragging(key) {
      return draggingKeys.has(key);
    },
    getItems(key) {
      return props.getItems(getKeys(key));
    },
    renderPreview(key) {
      return props.renderPreview(getKeys(key));
    },
    startDrag(key, event) {
      let keys = getKeys(key);

      setDraggingKeys(keys);

      if (typeof props.onDragStart === 'function') {
        props.onDragStart({
          ...event,
          keys
        });
      }
    },
    moveDrag(event) {
      if (typeof props.onDragMove === 'function') {
        props.onDragMove({
          ...event,
          keys: draggingKeys
        });
      }
    },
    endDrag(event) {
      if (typeof props.onDragEnd === 'function') {
        props.onDragEnd({
          ...event,
          keys: draggingKeys
        });
      }

      setDraggingKeys(new Set());
    }
  };
}
