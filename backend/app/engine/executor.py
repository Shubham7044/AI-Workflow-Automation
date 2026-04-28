from app.engine.actions import handle_action


def execute_workflow(workflow, context=None):
    results = []
    context = context or {}

    for action in workflow.get("actions", []):

        # 🔥 MERGE AI DATA (IMPORTANT FIX)
        if action.get("data"):
            context.update(action["data"])

            # map name → customer_name
            if "name" in action["data"]:
                context["customer_name"] = action["data"]["name"]

        print(f"📦 Context DURING execution: {context}")

        res = handle_action(action, context)
        results.append(res)

    return results