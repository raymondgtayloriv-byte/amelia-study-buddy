import zipfile
import xml.etree.ElementTree as ET
import sys
import os

def extract_text_from_pptx(pptx_path):
    text_runs = []
    try:
        with zipfile.ZipFile(pptx_path, 'r') as zf:
            # Slides are named slide1.xml, slide2.xml etc. Let's get them in order if possible
            slide_files = [item for item in zf.namelist() if item.startswith('ppt/slides/slide') and item.endswith('.xml')]
            
            # Sort slides numerically
            def get_slide_num(name):
                try:
                    return int(name.replace('ppt/slides/slide','').replace('.xml',''))
                except:
                    return 999
            
            slide_files.sort(key=get_slide_num)
            
            for item in slide_files:
                xml_content = zf.read(item)
                root = ET.fromstring(xml_content)
                
                # We extract paragraph text
                slide_text = []
                for elem in root.iter():
                    if elem.tag.endswith('}t'):
                        if elem.text:
                            slide_text.append(elem.text)
                if slide_text:
                    text_runs.append(f"--- Slide {get_slide_num(item)} ---\n" + "\n".join(slide_text))
            
            return "\n\n".join(text_runs)
    except Exception as e:
        return str(e)

if __name__ == '__main__':
    for f in sys.argv[1:]:
        out_name = os.path.basename(f).replace('.pptx', '_extracted.txt')
        text = extract_text_from_pptx(f)
        with open(out_name, 'w', encoding='utf-8') as out_f:
            out_f.write(text)
        print(f"Extracted to {out_name}")
