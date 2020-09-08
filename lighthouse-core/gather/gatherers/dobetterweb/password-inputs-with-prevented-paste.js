/**
 * @license Copyright 2017 The Lighthouse Authors. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 */
'use strict';

/* global document ClipboardEvent getNodeInfo */

const Gatherer = require('../gatherer.js');
const pageFunctions = require('../../../lib/page-functions.js');

// This is run in the page, not Lighthouse itself.
/**
 * @return {LH.Artifacts['PasswordInputsWithPreventedPaste']}
 */
/* istanbul ignore next */
function findPasswordInputsWithPreventedPaste() {
  return Array.from(document.querySelectorAll('input[type="password"]'))
    .filter(passwordInput =>
      !passwordInput.dispatchEvent(
        new ClipboardEvent('paste', {cancelable: true})
      )
    )
    .map(passwordInput => ({
      // @ts-expect-error - getNodeInfo put into scope via stringification
      ...getNodeInfo(passwordInput),
    }));
}

class PasswordInputsWithPreventedPaste extends Gatherer {
  /**
   * @param {LH.Gatherer.PassContext} passContext
   * @return {Promise<LH.Artifacts['PasswordInputsWithPreventedPaste']>}
   */
  afterPass(passContext) {
    const expression = `(() => {
      ${pageFunctions.getBoundingClientRectString};
      ${pageFunctions.getNodePathString};
      ${pageFunctions.getNodeSelectorString};
      ${pageFunctions.getNodeLabelString};
      ${pageFunctions.getNodeInfoString};
      ${pageFunctions.getOuterHTMLSnippetString};
      return (${findPasswordInputsWithPreventedPaste.toString()}());
    })()`;

    return passContext.driver.evaluateAsync(expression);
  }
}


module.exports = PasswordInputsWithPreventedPaste;
