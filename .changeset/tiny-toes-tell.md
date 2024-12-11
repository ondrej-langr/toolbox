---
'tsuru': minor
---

BREAKING: Removes jsonSchema and Json type and instead introduces jsonLikeObjectSchema and JsonLikeObject as a replacement. Underlying logic relies mainly that top JSON values are always objects instead of sometimes being literals. This way the type definition can be cleaner and more reasonable to end users.
