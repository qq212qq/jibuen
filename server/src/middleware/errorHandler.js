/**
 * 全局错误处理中间件
 */
export default function errorHandler(err, req, res, next) {
  console.error(`[错误] ${err.message}`);
  console.error(err.stack);

  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || '服务器内部错误',
  });
}
