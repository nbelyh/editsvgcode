import { notifications } from '@mantine/notifications';
import { EditSvgCodeDb, type GalleryMeta } from './firebase';
import { VISIBILITY_LABEL, VISIBILITY_MESSAGE, GALLERY_META_UPDATED } from './visibility';

export type PublishMode = 'publish' | 'edit';

/**
 * The one publish/edit-gallery-info submit flow, shared by the editor Share
 * menu and the Files page: performs the write and shows the success toast.
 * Rejections propagate — the publish dialog keeps itself open and shows the
 * error; callers only update their local state after this resolves.
 */
export async function submitGalleryMeta(fileId: string, mode: PublishMode, meta: GalleryMeta): Promise<void> {
  const db = new EditSvgCodeDb();
  if (mode === 'publish') {
    await db.setVisibility(fileId, 'public', meta);
    notifications.show({ title: VISIBILITY_LABEL.public, message: VISIBILITY_MESSAGE.public, color: 'blue' });
  } else {
    await db.setDocumentMeta(fileId, meta);
    notifications.show({ ...GALLERY_META_UPDATED, color: 'blue' });
  }
}
