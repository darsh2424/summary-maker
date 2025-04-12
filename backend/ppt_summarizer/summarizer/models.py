from django.db import models

class UploadedFile(models.Model):
    file = models.FileField(upload_to="uploads/")
    uploaded_at = models.DateTimeField(auto_now_add=True)

class Summary(models.Model):
    file = models.ForeignKey(UploadedFile, on_delete=models.CASCADE)
    text = models.TextField()
    summary = models.TextField(blank=True, null=True)
    ppt_file = models.FileField(upload_to="presentations/", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
