const postsUpload = require("../../services/posts/postsUpload.service");
const { getDecodedHeader, getUniqueFileName, getFileExtension } = require("../../utils");
const path = require("path");
const fsAsync = require("fs").promises;
const fs = require("fs");
const zlib = require('zlib');
const { UPLOAD_DIR, POSTS_UPLOAD_DIR } = require("../../config/paths.config");
const sharp = require("sharp");
const logger = require("../../utils/logger");

module.exports = async function handlePostsUpload (req, res) {
    let userData;
    try {
        const postId = req.params.id;
        userData = req.userData;

        const postRecord = await postsUpload.findPost(postId);
        if (!postRecord) {
            return res.status(404).json({
                success: false,
                code: "POST_IS_NOT_FOUND",
                status: 404,
                message: `Пост под ID: ${postId} отсутствует.`,
            });
        }

        if (userData.user.id !== postRecord.author_id && !userData.user.is_admin) {
            return res.status(403).json({
                success: false,
                code: "ACCESS_DENIED",
                status: 403,
                message: `Отказано в доступе.`,
            });
        }

        let blockId = getDecodedHeader(req.headers, 'x-block-id');

        const blockImageRecord = await postsUpload.findBlockImageForBlockId(blockId);

        let fileName = getDecodedHeader(req.headers, 'x-file-name');
        if (fileName.includes('..') || path.isAbsolute(fileName) || !fileName) {
            fileName = `${blockImageRecord.original_name}.${await getFileExtension(blockImageRecord.mime_type)}`;
        }

        const uploadUserPostsDir = path.join(POSTS_UPLOAD_DIR, `${blockImageRecord.post.id}`);
        await fsAsync.mkdir(uploadUserPostsDir, { recursive: true });
        fileName = await getUniqueFileName(uploadUserPostsDir, fileName);
        const filePath = path.join(uploadUserPostsDir, fileName);
        const gzFilePath = `${filePath}.gz`;
        const relativePath = path.relative(UPLOAD_DIR, filePath);

        const writeStream = fs.createWriteStream(filePath);
        const gzip = zlib.createGzip();
        const gzWriteStream = fs.createWriteStream(gzFilePath);

        const imageTransformer = sharp()
        .resize({ width: 1920, withoutEnlargement: true }) // ограничение размера, если нужно
            .jpeg({ quality: 90, force: false })   // если формат jpeg — снизим качество, иначе пропустит
            .png({ compressionLevel: 9, force: false }) // если png — применим сжатие без конвертации
            .webp({ quality: 90, force: false });  // если webp — снизим качество без конвертации

        writeStream.on('error', async (err) => {
            logger.error(err, "POSTS_UPLOAD_CONTROLLER | Ошибка записи файла");
            console.log('Ошибка записи файла: ', err);
        });

        gzWriteStream.on('error', async (err) => {
            logger.error(err, "POSTS_UPLOAD_CONTROLLER | Ошибка записи gz файла");
            console.log('Ошибка записи gz файла: ', err);
        });

        req.on('error',  async (err) => {
            logger.error(err, "POSTS_UPLOAD_CONTROLLER | Ошибка при загрузке файла");
            console.log('Ошибка при загрузке файла: ', err);
        })

        req.pipe(imageTransformer).pipe(writeStream);
        req.pipe(imageTransformer.clone()).pipe(gzip).pipe(gzWriteStream);

        let originalFinished = false;
        let gzFinished = false;

        const checkAllFinished = async () => {
            if (originalFinished && gzFinished) {
                const updateStatus = await postsUpload.updateImageInfo(blockImageRecord.id, blockImageRecord.block_id, fileName, filePath, relativePath);
                if (!updateStatus) {
                    return res.status(500).json({
                        success: false,
                        code: "POST_CREATED_ERROR",
                        status: 500,
                        message: "Сохранения изображения для поста.",
                    });
                }

                res.status(200).json({
                    success: true,
                    code: 'IMAGE_UPLOAD',
                    status: 200,
                    message: 'Изображение загружено.',
                    data: {
                        filePath
                    }
                });
            }
        };

        writeStream.on('finish', async () => {
            originalFinished = true;
            await checkAllFinished();
        });

        gzWriteStream.on('finish', async () => {
            gzFinished = true;
            await checkAllFinished();
        });
    } catch (error) {
        logger.error(error, "POSTS_UPLOAD_CONTROLLER");

        const errorBody = {
            success: false,
            code: 'SERVER_ERROR',
            status: 500,
            message: 'Серверная ошибка. Попробуйте позже.'
        }
        return res.status(500).json(errorBody);
    }
};