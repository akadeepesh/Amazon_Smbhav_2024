
from typing import List, Dict
from transformers import pipeline, AutoTokenizer, AutoModelForCausalLM
import torch
import re

class ProductGenerator:
    def __init__(self):
        """Initialize the generator with a free-to-use model from Hugging Face"""
        try:
            # Using a smaller model suitable for product descriptions
            model_name = "facebook/opt-125m"  # Much smaller than GPT but still effective
            
            # Initialize tokenizer and model
            self.tokenizer = AutoTokenizer.from_pretrained(model_name)
            self.model = AutoModelForCausalLM.from_pretrained(model_name)
            
            # Move to GPU if available
            self.device = "cuda" if torch.cuda.is_available() else "cpu"
            self.model.to(self.device)
            
            # Set padding token if not already set
            if self.tokenizer.pad_token is None:
                self.tokenizer.pad_token = self.tokenizer.eos_token
            
            print(f"Model loaded successfully on {self.device}")
            
        except Exception as e:
            print(f"Error loading model: {str(e)}")
            raise

    def _generate_description(self, item: str, context: str) -> str:
        """Generate a product description using the model"""
        try:
            prompt = f"""Generate a product description for {item}.
            Context: {context}
            Product Description:"""
            
            # Properly handle input encoding with attention mask
            inputs = self.tokenizer(
                prompt,
                return_tensors="pt",
                padding=True,
                truncation=True,
                max_length=512,
                return_attention_mask=True
            ).to(self.device)
            
            # Generate text with proper sampling parameters
            outputs = self.model.generate(
                input_ids=inputs["input_ids"],
                attention_mask=inputs["attention_mask"],
                max_length=150,
                num_return_sequences=1,
                do_sample=True,  # Enable sampling
                temperature=0.7,
                pad_token_id=self.tokenizer.pad_token_id,
                eos_token_id=self.tokenizer.eos_token_id
            )
            
            description = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            
            # Clean up the description
            description = description.replace(prompt, "").strip()
            description = re.sub(r'\s+', ' ', description)
            
            return description

        except Exception as e:
            print(f"Error generating description: {str(e)}")
            return f"Quality {item} for your needs"

    def _generate_features(self, item: str, description: str) -> List[str]:
        """Extract features from the generated description"""
        try:
            prompt = f"""Based on this description: {description}
            List 3 key features of the {item}:"""
            
            # Properly handle input encoding with attention mask
            inputs = self.tokenizer(
                prompt,
                return_tensors="pt",
                padding=True,
                truncation=True,
                max_length=512,
                return_attention_mask=True
            ).to(self.device)
            
            outputs = self.model.generate(
                input_ids=inputs["input_ids"],
                attention_mask=inputs["attention_mask"],
                max_length=100,
                num_return_sequences=1,
                do_sample=True,  # Enable sampling
                temperature=0.7,
                pad_token_id=self.tokenizer.pad_token_id,
                eos_token_id=self.tokenizer.eos_token_id
            )
            
            features_text = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            
            # Extract features from generated text
            features = features_text.replace(prompt, "").strip().split("\n")
            features = [f.strip() for f in features if f.strip()]
            
            # Ensure we have at least 3 features
            while len(features) < 3:
                features.append(f"Premium {item} quality")
                
            return features[:3]

        except Exception as e:
            print(f"Error generating features: {str(e)}")
            return [
                f"High-quality {item}",
                f"Durable {item} design",
                f"Premium {item} features"
            ]

    def _estimate_price(self, description: str, features: List[str]) -> str:
        """Estimate price based on description and features"""
        # Simple price estimation based on text length and feature count
        base_price = 29.99
        price_factor = (len(description) / 100) + (len(features) * 0.5)
        estimated_price = base_price * max(1, price_factor)
        return f"${estimated_price:.2f}"

    def generate_product_listing(self, detected_objects: List[str], transcription: str) -> List[Dict]:
        """Generate product listings based on detected objects and transcription"""
        products = []
        
        # Process each unique object
        for obj in set(detected_objects):
            try:
                # Generate product description
                description = self._generate_description(obj, transcription)
                
                # Generate features
                features = self._generate_features(obj, description)
                
                # Generate price
                price = self._estimate_price(description, features)
                
                # Create product listing
                product = {
                    "title": f"Premium {obj.title()} Solution",
                    "description": description,
                    "features": features,
                    "estimated_price": price
                }
                
                products.append(product)
                
            except Exception as e:
                print(f"Error generating product for {obj}: {str(e)}")
                continue
        
        return products

    def validate_product_listing(self, products: List[Dict]) -> List[Dict]:
        """Validate and clean up product listings"""
        required_fields = ["title", "description", "features", "estimated_price"]
        validated_products = []
        
        for product in products:
            # Ensure all required fields exist
            validated_product = {field: product.get(field, "N/A") for field in required_fields}
            
            # Clean up and validate each field
            validated_product["title"] = validated_product["title"][:100]  # Limit title length
            validated_product["description"] = validated_product["description"][:500]  # Limit description length
            validated_product["features"] = validated_product["features"][:3]  # Limit to 3 features
            
            validated_products.append(validated_product)
            
        return validated_products