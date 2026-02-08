
import os
import markdown
from typing import List, Dict
import json

class DocumentLoader:
    def __init__(self, knowledge_base_path="rag/knowledge_base"):
        self.knowledge_base_path = knowledge_base_path
        
    def load_all_documents(self) -> List[Dict]:
        """加载所有知识库文档"""
        documents = []
        
        if not os.path.exists(self.knowledge_base_path):
            print(f"知识库路径不存在: {self.knowledge_base_path}")
            return documents
        
        # 加载Markdown文件
        for filename in os.listdir(self.knowledge_base_path):
            if filename.endswith('.md'):
                file_path = os.path.join(self.knowledge_base_path, filename)
                content = self._load_markdown_file(file_path)
                
                if content:
                    # 分割成小块
                    chunks = self._chunk_document(content, filename)
                    documents.extend(chunks)
        
        return documents
    
    def _load_markdown_file(self, file_path: str) -> str:
        """加载Markdown文件"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # 将Markdown转为纯文本
            html = markdown.markdown(content)
            # 简单去除HTML标签
            import re
            text = re.sub(r'<[^>]+>', '', html)
            text = re.sub(r'\n\s*\n', '\n\n', text)
            
            return text
        except Exception as e:
            print(f"加载文件失败 {file_path}: {e}")
            return ""
    
    def _chunk_document(self, content: str, source: str, chunk_size: int = 500) -> List[Dict]:
        """将文档分割成块"""
        chunks = []
        paragraphs = content.split('\n\n')
        
        current_chunk = ""
        for para in paragraphs:
            para = para.strip()
            if not para:
                continue
            
            if len(current_chunk) + len(para) < chunk_size:
                current_chunk += para + "\n\n"
            else:
                if current_chunk:
                    chunks.append({
                        "content": current_chunk.strip(),
                        "metadata": {"source": source, "type": "knowledge_base"}
                    })
                current_chunk = para + "\n\n"
        
        if current_chunk:
            chunks.append({
                "content": current_chunk.strip(),
                "metadata": {"source": source, "type": "knowledge_base"}
            })
        
        return chunks
    
    def create_financial_facts(self) -> List[Dict]:
        """创建金融事实数据"""
        facts = [
            {
                "content": "今日美元兑人民币汇率：7.18",
                "metadata": {"source": "实时数据", "type": "exchange_rate", "date": "2024-01-15"}
            },
            {
                "content": "当前基准存款利率：1.5%（一年期）",
                "metadata": {"source": "央行数据", "type": "interest_rate", "date": "2024-01-15"}
            },
            {
                "content": "上证指数：2900点",
                "metadata": {"source": "股市数据", "type": "stock_market", "date": "2024-01-15"}
            },
            {
                "content": "比特币价格：42000美元",
                "metadata": {"source": "加密货币", "type": "crypto", "date": "2024-01-15"}
            },
            {
                "content": "黄金价格：2020美元/盎司",
                "metadata": {"source": "大宗商品", "type": "commodity", "date": "2024-01-15"}
            }
        ]
        return facts