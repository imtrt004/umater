'use client';

import { useEffect } from 'react';
import { injectContentsquareScript } from '@contentsquare/tag-sdk';

const SITE_ID = '6369744';

const ContentsquareScript = () => {
  useEffect(() => {
    // Initialize ContentSquare script with the site ID
    injectContentsquareScript({
      siteId: SITE_ID,
      async: true, // Load asynchronously to prevent blocking page rendering
      defer: false // Don't defer execution after document parsing
    });
  }, []);

  return null; // This component doesn't render anything
};

export default ContentsquareScript; 