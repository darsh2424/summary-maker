import os
import pytz
from django.http import JsonResponse
from django.conf import settings
from rest_framework.decorators import api_view
from django.utils.timezone import now
from .utils import extract_text_from_pdf, summarize_with_deepseek, create_ppt
from sentence_transformers import SentenceTransformer, util

IST = pytz.timezone("Asia/Kolkata")
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

@api_view(["POST"])
def chat_mode(request):
    uploaded_file = request.FILES.get("file")
    user_prompt = request.data.get("prompt", "")
    last_response = request.data.get("last_response", "")
    print(f"{user_prompt[:30]}")
    try:
        extracted_text = ""
        if uploaded_file:
            file_path = os.path.join(settings.MEDIA_ROOT, uploaded_file.name)
            with open(file_path, "wb") as f:
                for chunk in uploaded_file.chunks():
                    f.write(chunk)
            extracted_text = extract_text_from_pdf(file_path)

        if last_response and extracted_text:
            embeddings = embedding_model.encode([last_response, extracted_text], convert_to_tensor=True)
            similarity_score = float(util.pytorch_cos_sim(embeddings[0], embeddings[1])[0][0])

            # print(f"🧠 Similarity Score: {similarity_score:.4f}")

            if similarity_score > 0.45:
                full_context = f"{last_response}\n{extracted_text}"
            else:
                full_context = extracted_text
        else:
            # full_context = last_response or extracted_text
            full_context = last_response.strip() or extracted_text.strip()

        # print("fullcontext:",f"{full_context}")
        # return JsonResponse({"success": f"{user_prompt}"})
        summary = summarize_with_deepseek(full_context.strip(), user_prompt)
        return JsonResponse({"summary": summary})
    except Exception as e:
        return JsonResponse({"error": f"Failed to process: {str(e)}"}, status=500)
    

@api_view(["POST"])
def ppt_mode(request):
    summary_text = request.data.get("summary", "")
    if not summary_text:
        return JsonResponse({"error": "No summary provided."}, status=400)

    timestamp = now().astimezone(IST).strftime("%Y%m%d_%H%M%S")
    ppt_name = f"summary_{timestamp}.pptx"
    ppt_path = os.path.join(settings.MEDIA_ROOT, "uploads", ppt_name)

    try:
        summary = summarize_with_deepseek(summary_text, "")
        os.makedirs(os.path.dirname(ppt_path), exist_ok=True)
        create_ppt(summary, ppt_path)
        return JsonResponse({"message": "PPT created successfully!", "ppt_url": f"/media/uploads/{ppt_name}"})
    except Exception as e:
        return JsonResponse({"error": f"PPT Generation Failed: {str(e)}"}, status=500)
