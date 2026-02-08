import os
import re
import io
from typing import Dict, List, Optional
from PIL import Image, ImageEnhance
import numpy as np

class ImageService:
    def __init__(self):
        self._init_ocr_engine()
        self._init_image_analysis()
        print("✅ image initialized")
    
    def _init_ocr_engine(self):
        """初始化OCR引擎"""
        self.ocr_provider = None
        self.easyocr_available = False
        self.easyocr_reader = None
        
        try:
            import pytesseract
            self.pytesseract = pytesseract
            tesseract_path = os.getenv('TESSERACT_PATH')
            if tesseract_path and os.path.exists(tesseract_path):
                pytesseract.pytesseract.tesseract_cmd = tesseract_path
            print("✅ Tesseract OCR 可用")
            self.ocr_provider = 'tesseract'
        except Exception as e:
            print(f"❌ OCR 初始化失败: {e}")
            self.ocr_provider = None
        
        # 尝试初始化 EasyOCR 作为备用
        try:
            import easyocr
            self.easyocr_available = True
            print("✅ EasyOCR 可用")
        except ImportError:
            self.easyocr_available = False
            print("⚠️ EasyOCR 不可用，仅使用 Tesseract")
    
    def _init_image_analysis(self):
        """初始化图像分析模块"""
        self.analysis_enabled = False
        self.opencv_available = False
        
        try:
            import cv2
            self.cv2 = cv2
            self.opencv_available = True
            print("✅ OpenCV 已加载")
        except ImportError:
            print("⚠️ OpenCV 不可用")
        
        self.analysis_enabled = True
        print("✅ 图像分析模块初始化成功")
    
    def preprocess_image(self, image: Image.Image) -> Image.Image:
        """图像预处理"""
        try:
            # 转换为灰度图
            if image.mode != 'L':
                image = image.convert('L')
            
            # 缩放图像（最大尺寸 1600）
            max_size = 1600
            if image.size[0] > max_size or image.size[1] > max_size:
                ratio = min(max_size / image.size[0], max_size / image.size[1])
                new_size = (int(image.size[0] * ratio), int(image.size[1] * ratio))
                image = image.resize(new_size, Image.Resampling.LANCZOS)
            
            # 增强对比度
            enhancer = ImageEnhance.Contrast(image)
            image = enhancer.enhance(1.5)
            
            # 增强锐度
            enhancer = ImageEnhance.Sharpness(image)
            image = enhancer.enhance(1.2)
            
            return image
        except Exception as e:
            print(f"❌ 图像预处理失败: {e}")
            return image
    
    def analyze_image(self, image_data: bytes) -> Dict[str, any]:
        """分析图像"""
        try:
            image = Image.open(io.BytesIO(image_data))
            
            # 预处理图像
            processed_image = self.preprocess_image(image)
            
            # 提取文本
            text = self._extract_text(processed_image)
            
            result = {
                "size": image.size,
                "format": image.format,
                "mode": image.mode,
                "text_content": text,
                "is_financial_document": self._is_financial_document(text),
                "analysis": {},
                "preprocessed": True
            }
            
            # 如果是金融文档，进行详细分析
            if result["is_financial_document"]:
                result["analysis"].update(self._analyze_financial_document(text))
            
            return result
        except Exception as e:
            return {"error": str(e), "analysis": {}}
    
    def _extract_text(self, image: Image.Image) -> str:
        """从图像中提取文本"""
        if not self.ocr_provider:
            return ""
        
        text = ""
        
        # 使用 Tesseract OCR
        try:
            custom_config = r'--oem 3 --psm 6'
            text = self.pytesseract.image_to_string(
                image, 
                lang='chi_sim+eng',
                config=custom_config
            )
            
            # 如果提取的文本太少，尝试使用 EasyOCR
            if len(text.strip()) < 10 and self.easyocr_available:
                try:
                    # 初始化 EasyOCR 读取器（如果尚未初始化）
                    if self.easyocr_reader is None:
                        import easyocr
                        self.easyocr_reader = easyocr.Reader(['ch_sim', 'en'])
                    
                    # 将 PIL 图像转换为 numpy 数组
                    img_array = np.array(image)
                    
                    # 确保图像是 RGB 格式
                    if len(img_array.shape) == 2:
                        img_array = np.stack([img_array] * 3, axis=-1)
                    
                    # 使用 EasyOCR 读取文本
                    results = self.easyocr_reader.readtext(img_array)
                    texts = [result[1] for result in results]
                    easyocr_text = " ".join(texts)
                    
                    # 如果 EasyOCR 提取到更多文本，使用它
                    if len(easyocr_text.strip()) > len(text.strip()):
                        text = easyocr_text
                except Exception as e:
                    print(f"❌ EasyOCR 备用识别失败: {e}")
            
            return text.strip()
        except Exception as e:
            print(f"❌ OCR 提取错误: {e}")
            return ""
    
    def _is_financial_document(self, text: str) -> bool:
        """判断是否是金融文档"""
        if not text:
            return False
        
        text_lower = text.lower()
        
        # 检查金融相关关键词
        financial_keywords = [
            '银行', '支票', '汇票', '账单', '发票', '收据', '金额', '合计', '总计',
            '支付', '付款', '收款', '人民币', '美元', '欧元', '日元', '港币',
            '身份证', '护照', '驾驶证', '证件',
            'bank', 'check', 'invoice', 'receipt', 'amount', 'total', 'payment', 'money'
        ]
        
        for keyword in financial_keywords:
            if keyword in text_lower:
                return True
        
        # 检查常见的金融文档格式特征
        patterns = [
            r'no[.:]\s*\w+',  # No. 123
            r'编号[:：]\s*\w+',  # 编号：123
            r'date[:：]\s*\d',  # Date: 2024
            r'日期[:：]\s*\d',  # 日期：2024
            r'amount[:：]\s*[\d,]',  # Amount: 1,000
            r'金额[:：]\s*[\d,]',  # 金额：1,000
            r'\$\s*[\d,]+\.?\d*',  # $1,000.00
            r'¥\s*[\d,]+\.?\d*',  # ¥1,000.00
            r'￥\s*[\d,]+\.?\d*'  # ￥1,000.00
        ]
        
        for pattern in patterns:
            if re.search(pattern, text_lower, re.IGNORECASE):
                return True
        
        return False
    
    def _analyze_financial_document(self, text: str) -> Dict:
        """分析金融文档"""
        analysis = {
            "document_type": "unknown",
            "amounts_found": [],
            "dates_found": [],
            "parties_involved": [],
            "confidence": "low"
        }
        
        # 尝试识别文档类型
        if any(word in text.lower() for word in ['支票', 'cheque']):
            analysis["document_type"] = "check"
            analysis["confidence"] = "medium"
        elif any(word in text.lower() for word in ['发票', 'invoice']):
            analysis["document_type"] = "invoice"
            analysis["confidence"] = "medium"
        elif any(word in text.lower() for word in ['收据', 'receipt']):
            analysis["document_type"] = "receipt"
            analysis["confidence"] = "medium"
        elif any(word in text.lower() for word in ['身份证', 'id card']):
            analysis["document_type"] = "id_card"
            analysis["confidence"] = "high"
        
        # 提取金额
        amount_patterns = [
            r'¥\s*([\d,]+\.?\d*)',
            r'￥\s*([\d,]+\.?\d*)',
            r'\$\s*([\d,]+\.?\d*)',
            r'金额[:：]\s*([\d,]+\.?\d*)',
            r'合计[:：]\s*([\d,]+\.?\d*)',
            r'total[:：]\s*([\d,]+\.?\d*)',
            r'amount[:：]\s*([\d,]+\.?\d*)',
            r'人民币\s*([\d,]+\.?\d*)'
        ]
        
        for pattern in amount_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                amount = match.replace(',', '')
                if amount:
                    analysis["amounts_found"].append(amount)
        
        # 提取日期
        date_patterns = [
            r'\d{4}[-/]\d{1,2}[-/]\d{1,2}',  # 2024-01-15
            r'\d{1,2}[-/]\d{1,2}[-/]\d{4}',  # 15/01/2024
            r'日期[:：]\s*(\d{4}[-/]\d{1,2}[-/]\d{1,2})',
            r'date[:：]\s*(\d{4}[-/]\d{1,2}[-/]\d{1,2})'
        ]
        
        for pattern in date_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            analysis["dates_found"].extend(matches)
        
        # 提取相关方信息
        lines = text.split('\n')
        for line in lines:
            if any(keyword in line for keyword in ['银行', '公司', '姓名', 'name', 'account']):
                analysis["parties_involved"].append(line.strip())
        
        return analysis
    
    def validate_id_card(self, image_data: bytes) -> Dict:
        """验证身份证"""
        try:
            image = Image.open(io.BytesIO(image_data))
            processed_image = self.preprocess_image(image)
            text = self._extract_text(processed_image)
            
            id_pattern = r'(\d{6})(19|20)(\d{2})(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])(\d{3})(\d|X|x)'
            id_matches = re.findall(id_pattern, text)
            
            validation_result = {
                "is_valid": bool(id_matches),
                "id_numbers_found": ["".join(match) for match in id_matches],
                "name_found": self._extract_chinese_name(text),
                "text_content": text[:500],  # 只返回前500字符
                "validation_method": "regex_pattern"
            }
            
            return validation_result
        except Exception as e:
            return {"error": str(e), "is_valid": False}
    
    def _extract_chinese_name(self, text: str) -> List[str]:
        """提取中文名字"""
        name_pattern = r'姓名[:：]?\s*([\u4e00-\u9fa5]{2,4})'
        matches = re.findall(name_pattern, text)
        return matches